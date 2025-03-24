import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, AttendeeRole, RecurrencePattern } from "@prisma/client";
import { checkUser } from "@/lib/checkUser";

const prisma = new PrismaClient();

// Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      appointmentTypeId,
      startTime,
      endTime,
      timeZone,
      locationOrLink,
      attendees,
      isRecurring,
      recurrencePattern,
      recurrenceEndDate,
    } = body;

    // Validate required fields
    if (!appointmentTypeId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create the appointment
    const appointment = await prisma.$transaction(async (tx) => {
      const newAppointment = await tx.appointment.create({
        data: {
          appointmentTypeId,
          hostId: user.id,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          timeZone: timeZone || "UTC",
          locationOrLink,
          isRecurring: !!isRecurring,
          recurrencePattern: recurrencePattern || null,
          recurrenceEndDate: recurrenceEndDate
            ? new Date(recurrenceEndDate)
            : null,
        },
      });

      // Add attendees if specified
      if (attendees && attendees.length > 0) {
        const attendeePromises = attendees.map(
          (attendee: { userId: string; role?: string; comments?: string }) => {
            return tx.appointmentAttendee.create({
              data: {
                appointmentId: newAppointment.id,
                userId: attendee.userId,
                role: (attendee.role as AttendeeRole) || "client",
                additionalComments: attendee.comments,
              },
            });
          },
        );

        await Promise.all(attendeePromises);
      }

      return newAppointment;
    });

    // Handle recurring appointments if needed
    if (isRecurring && recurrencePattern && recurrenceEndDate) {
      const recurringAppointments = await createRecurringAppointments(
        {
          id: appointment.id,
          appointmentTypeId: appointment.appointmentTypeId,
          hostId: appointment.hostId,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          timeZone: appointment.timeZone,
          locationOrLink: appointment.locationOrLink || undefined,
        },
        recurrencePattern,
        new Date(recurrenceEndDate),
        attendees,
      );

      return NextResponse.json(
        {
          appointment,
          recurringAppointments,
          message: "Appointment(s) created successfully",
        },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        appointment,
        message: "Appointment created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 },
    );
  }
}

// Function to generate recurring appointments
async function createRecurringAppointments(
  parentAppointment: {
    id: string;
    appointmentTypeId: string;
    hostId: string;
    startTime: Date;
    endTime: Date;
    timeZone: string;
    locationOrLink?: string;
  },
  pattern: string,
  endDate: Date,
  attendees?: Array<{
    userId: string;
    role?: string;
    comments?: string;
  }>,
) {
  const recurringAppointments = [];
  const startDate = new Date(parentAppointment.startTime);

  // Calculate duration of the appointment in milliseconds
  const duration =
    new Date(parentAppointment.endTime).getTime() - startDate.getTime();

  // Set up date increments based on pattern
  let dateIncrement: number;
  switch (pattern) {
    case "daily":
      dateIncrement = 1; // 1 day
      break;
    case "weekly":
      dateIncrement = 7; // 7 days
      break;
    case "biweekly":
      dateIncrement = 14; // 14 days
      break;
    case "monthly":
      dateIncrement = 30; // ~30 days (simplified)
      break;
    default:
      dateIncrement = 7; // Default to weekly
  }

  // Generate recurring dates
  let currentDate = new Date(startDate);
  currentDate.setDate(currentDate.getDate() + dateIncrement); // Start with next occurrence

  while (currentDate <= endDate) {
    // Calculate the new end time based on the duration
    const newEndTime = new Date(currentDate.getTime() + duration);

    // Create the recurring appointment
    const recurringAppointment = await prisma.$transaction(async (tx) => {
      const newRecurringAppointment = await tx.appointment.create({
        data: {
          appointmentTypeId: parentAppointment.appointmentTypeId,
          hostId: parentAppointment.hostId,
          parentAppointmentId: parentAppointment.id,
          startTime: currentDate,
          endTime: newEndTime,
          timeZone: parentAppointment.timeZone,
          locationOrLink: parentAppointment.locationOrLink ?? undefined,
          isRecurring: true,
          recurrencePattern: (pattern as RecurrencePattern) || null,
        },
      });

      // Add attendees to recurring appointments if needed
      if (attendees && attendees.length > 0) {
        const attendeePromises = attendees.map((attendee) => {
          return tx.appointmentAttendee.create({
            data: {
              appointmentId: newRecurringAppointment.id,
              userId: attendee.userId,
              role: (attendee.role as AttendeeRole) || "client",
              additionalComments: attendee.comments,
            },
          });
        });

        await Promise.all(attendeePromises);
      }

      return newRecurringAppointment;
    });

    recurringAppointments.push(recurringAppointment);

    // Move to next date
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + dateIncrement);
  }

  return recurringAppointments;
}

// Get all appointments for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 },
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const upcoming = searchParams.get("upcoming") === "true";
    const past = searchParams.get("past") === "true";

    // Build the query
    let dateFilter = {};

    if (upcoming) {
      dateFilter = {
        startTime: {
          gte: new Date(),
        },
      };
    } else if (past) {
      dateFilter = {
        startTime: {
          lt: new Date(),
        },
      };
    }

    // Find appointments where user is host or attendee
    const appointments = await prisma.appointment.findMany({
      where: {
        OR: [
          { hostId: user.id },
          {
            attendees: {
              some: {
                userId: user.id,
              },
            },
          },
        ],
        ...dateFilter,
      },
      include: {
        appointmentType: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attendees: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                imageUrl: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    return NextResponse.json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointments" },
      { status: 500 },
    );
  }
}
