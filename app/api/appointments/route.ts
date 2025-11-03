import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, RecurrencePattern } from "@prisma/client";
import { checkUser } from "@/lib/checkUser";
import { createZoomMeeting, formatRecurrenceData } from "@/lib/zoomApi";

// Type definition for recurrence data
interface RecurrenceData {
  type?: number;
  repeat_interval?: number;
  weekly_days?: number[];
  monthly_day?: number;
  end_times?: number;
  end_date_time?: string;
  [key: string]: unknown;
}

// Zoom meeting details interface
interface ZoomMeetingDetails {
  topic: string;
  type: number;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    waiting_room: boolean;
    auto_recording: "none" | "local" | "cloud";
  };
  recurrence?: {
    type: number;
    repeat_interval?: number;
    weekly_days?: string;
    monthly_day?: number;
    end_times?: number;
    end_date_time?: string;
  };
}

const prismaClient = new PrismaClient();

// Create a new appointment
export async function POST(request: NextRequest) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      appointmentTypeId,
      date,
      isRecurring,
      recurrencePattern,
      recurrenceData,
      additionalComments,
      attendees,
    } = body;

    // Validate required fields
    if (!appointmentTypeId || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate recurrence settings to avoid unexpected behavior
    const shouldCreateRecurring =
      isRecurring && recurrencePattern && recurrenceData;

    // Log useful information to diagnose issues
    console.log(
      `Creating appointment with recurrence: ${shouldCreateRecurring}`
    );
    console.log(`Recurrence pattern: ${recurrencePattern}`);
    console.log(`Recurrence data:`, recurrenceData);

    // Get appointment type details
    const appointmentType = await prismaClient.appointmentType.findUnique({
      where: { id: appointmentTypeId },
    });

    if (!appointmentType) {
      return NextResponse.json(
        { error: "Invalid appointment type" },
        { status: 400 }
      );
    }

    const startTime = new Date(date);
    // Default to 1 hour duration
    const endTime = new Date(new Date(date).getTime() + 60 * 60 * 1000);

    // Create Zoom meeting
    let zoomMeeting = null;
    try {
      const meetingTopic = `${appointmentType.title} with ${user.name || "Host"}`;
      const durationMinutes = Math.round(
        (endTime.getTime() - startTime.getTime()) / (60 * 1000)
      );

      const meetingDetails: ZoomMeetingDetails = {
        topic: meetingTopic,
        type: isRecurring ? 3 : 2, // 2 for scheduled, 3 for recurring with fixed time
        start_time: startTime.toISOString(),
        duration: durationMinutes,
        timezone: "America/New_York", // Default timezone
        agenda: additionalComments || `${appointmentType.title} appointment`,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: true,
          auto_recording: "none",
        },
      };

      // Add recurrence info if needed
      if (isRecurring && recurrencePattern && recurrenceData) {
        meetingDetails.recurrence = formatRecurrenceData(
          recurrencePattern,
          recurrenceData as RecurrenceData
        );
      }

      zoomMeeting = await createZoomMeeting(meetingDetails);
    } catch (error) {
      console.error("Error creating Zoom meeting:", error);
      // Continue with appointment creation even if Zoom fails
    }

    // Create the appointment
    const appointment = await prismaClient.$transaction(async (tx) => {
      const appointmentData = {
        appointmentTypeId,
        startTime,
        endTime,
        isRecurring,
        hostId: user.id,
        locationOrLink: zoomMeeting ? zoomMeeting.join_url : null,
      };

      // Only add recurrence fields if it's a recurring appointment
      if (isRecurring) {
        Object.assign(appointmentData, {
          recurrencePattern: recurrencePattern as RecurrencePattern,
          recurrenceEndDate: recurrenceData?.end_date_time
            ? new Date(recurrenceData.end_date_time as string)
            : null,
        });
      }

      const newAppointment = await tx.appointment.create({
        data: appointmentData,
        include: {
          attendees: true,
        },
      });

      // Add attendees if specified
      if (attendees && attendees.length > 0) {
        for (const attendee of attendees) {
          await tx.appointmentAttendee.create({
            data: {
              appointmentId: newAppointment.id,
              email: attendee.email,
              userId: null, // Will be linked to user account if they sign up
              role: "client",
              additionalComments,
            },
          });
        }
      }

      return newAppointment;
    });

    // Return the appointment
    return NextResponse.json(
      {
        appointment,
        message: isRecurring
          ? "Recurring appointment created successfully"
          : "Appointment created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Failed to create appointment" },
      { status: 500 }
    );
  }
}

// Get all appointments for the current user
export async function GET(request: NextRequest) {
  try {
    const user = await checkUser();
    if (!user) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
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
    const appointments = await prismaClient.appointment.findMany({
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
      { status: 500 }
    );
  }
}
