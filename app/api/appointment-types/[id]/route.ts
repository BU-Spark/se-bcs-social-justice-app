import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const appointmentType = await prisma.appointmentType.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!appointmentType) {
      return NextResponse.json(
        { error: "Appointment type not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(appointmentType);
  } catch (error) {
    console.error("Error fetching appointment type:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment type" },
      { status: 500 },
    );
  }
}
