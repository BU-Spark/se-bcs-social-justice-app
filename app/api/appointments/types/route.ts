import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { checkUser } from "@/lib/checkUser";

const prisma = new PrismaClient();

// Create a new appointment type
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
    const { typeName, description } = body;

    // Validate required fields
    if (!typeName) {
      return NextResponse.json(
        { error: "Type name is required" },
        { status: 400 },
      );
    }

    // Create the appointment type
    const appointmentType = await prisma.$transaction(async (tx) => {
      return tx.appointmentType.create({
        data: {
          typeName,
          description,
        },
      });
    });

    return NextResponse.json(
      {
        appointmentType,
        message: "Appointment type created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating appointment type:", error);
    return NextResponse.json(
      { error: "Failed to create appointment type" },
      { status: 500 },
    );
  }
}

// Get all appointment types
export async function GET() {
  try {
    const appointmentTypes = await prisma.appointmentType.findMany({
      orderBy: {
        typeName: "asc",
      },
    });

    return NextResponse.json({ appointmentTypes });
  } catch (error) {
    console.error("Error fetching appointment types:", error);
    return NextResponse.json(
      { error: "Failed to fetch appointment types" },
      { status: 500 },
    );
  }
}
