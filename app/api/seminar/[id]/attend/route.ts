import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET all attendees for a seminar
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const attendees = await prisma.seminarAttendee.findMany({
      where: { seminarId: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(attendees);
  } catch (err) {
    console.error("Error fetching seminar attendees:", err);
    return NextResponse.json(
      { error: "Failed to fetch attendees" },
      { status: 500 },
    );
  }
}

// Register a new attendee
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "Missing name or email" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const seminar = await prisma.seminar.findUnique({
      where: { id: params.id },
    });
    if (!seminar) {
      return NextResponse.json({ error: "Seminar not found" }, { status: 404 });
    }

    // Avoid duplicate registration
    const existing = await prisma.seminarAttendee.findFirst({
      where: {
        seminarId: params.id,
        email: normalizedEmail,
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this seminar." },
        { status: 409 },
      );
    }

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
      { status: 500 },
    );
  }
}
