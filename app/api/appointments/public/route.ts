import { NextResponse } from "next/server";
import { AppointmentAccessType } from "@prisma/client";
import prisma from "@/lib/prisma";
import { createZoomMeeting } from "@/lib/zoomApi";

export async function GET() {
  try {
    // Find appointments with a public appointmentType
    const publicAppointments = await prisma.appointment.findMany({
      where: {
        appointmentType: {
          accessType: AppointmentAccessType.public,
        },
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
        attendees: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(publicAppointments);
  } catch (error) {
    console.error("Error fetching public appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch public appointments" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, description, startTime, endTime, hostId } = await req.json();

    if (!title || !startTime || !endTime || !hostId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create Zoom meeting
    const meeting = await createZoomMeeting({
      topic: title,
      type: 2,
      start_time: startTime,
      duration: Math.ceil(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
      ),
      timezone: "America/New_York",
      agenda: description || "",
    });

    // Find the "Seminars" AppointmentType
    const seminarType = await prisma.appointmentType.findFirst({
      where: { title: "Seminars", accessType: AppointmentAccessType.public },
    });

    if (!seminarType) {
      return NextResponse.json(
        { error: "Seminars type not found in database" },
        { status: 500 }
      );
    }

    // Create the seminar in DB
    const seminar = await prisma.appointment.create({
      data: {
        appointmentTypeId: seminarType.id,
        hostId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        timeZone: "America/New_York",
        locationOrLink: "Online",
        zoomLink: meeting.join_url, // store real Zoom link
        topic: title,
      },
      include: {
        appointmentType: true,
        host: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, seminar });
  } catch (error) {
    console.error("Error creating public seminar:", error);
    return NextResponse.json(
      { error: "Failed to create seminar" },
      { status: 500 }
    );
  }
}
