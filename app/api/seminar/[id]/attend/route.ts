import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, email } = await req.json();

    // Validate inputs
    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing name or email" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if seminar exists
    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
    });

    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // avoid duplicate registration for same seminar/email
    const existing = await prisma.seminarAttendee.findFirst({
      where: {
        seminarId: params.id,
        email: normalizedEmail,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this seminar." },
        { status: 409 }
      );
    }

    // new attence
    const attendee = await prisma.seminarAttendee.create({
      data: {
        seminarId: params.id,
        name: name.trim(),
        email: normalizedEmail,
      },
    });

    return NextResponse.json(attendee, { status: 201 });
  } catch (err) {
    console.error("Error registering attendee:", err);
    return NextResponse.json(
      { error: "Failed to register attendee" },
      { status: 500 }
    );
  }
}
