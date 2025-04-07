import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  try {
    const appointmentTypes = await prisma.appointmentType.findMany({
      select: {
        id: true,
        typeName: true,
        description: true,
        icon: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(appointmentTypes);
  } catch (error) {
    console.error("Failed to fetch appointment types:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment types" },
      { status: 500 },
    );
  }
}
