import { NextResponse } from "next/server";
import { AppointmentAccessType } from "@prisma/client";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const privateAppointments = await prisma.appointment.findMany({
      where: {
        appointmentType: {
          accessType: AppointmentAccessType.private,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        timeZone: true,
        locationOrLink: true, // ✅ Includes the Zoom link
        appointmentType: {
          select: {
            title: true,
            accessType: true,
          },
        },
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
          },
        },
        attendees: {
          select: {
            id: true,
            role: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "desc",
      },
    });

    return NextResponse.json(privateAppointments);
  } catch (error) {
    console.error("Error fetching private appointments:", error);
    return NextResponse.json(
      { error: "Failed to fetch private appointments" },
      { status: 500 }
    );
  }
}
