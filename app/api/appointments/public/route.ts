import { NextResponse } from "next/server";
import { AppointmentAccessType } from "@prisma/client";
import prisma from "@/lib/prisma";

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
