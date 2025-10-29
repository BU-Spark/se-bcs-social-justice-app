import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";

const prisma = new PrismaClient();

// GET all seminars
export async function GET() {
  try {
    const seminars = await prisma.seminar.findMany({
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        hostName: true,
        date: true,
        duration: true,
        accessType: true,
        image: true,
        mediaUrl: true,
        createdAt: true,
      },
      take: 20,
    });
    return NextResponse.json(seminars);
  } catch (err) {
    console.error("Error fetching seminars:", err);
    return NextResponse.json(
      { error: "Failed to fetch seminars" },
      { status: 500 },
    );
  }
}

// POST: Create new seminar (Admin only)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    // Must be logged in
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if the user is an admin in the DB
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
      select: { role: true },
    });

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Parse seminar data
    const data = await req.json();
    console.log("Received seminar data:", data);

    // Validate required fields
    if (
      !data.title ||
      !data.hostName ||
      !data.date ||
      !data.duration ||
      !data.zoomLink
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create new seminar record
    const seminar = await prisma.seminar.create({
      data: {
        title: data.title,
        description: data.description,
        hostName: data.hostName,
        date: new Date(data.date),
        duration: Number(data.duration),
        zoomLink: data.zoomLink,
        accessType: data.accessType ?? "public",
        image: data.image || null,
        mediaUrl: data.mediaUrl || null,
      },
    });

    return NextResponse.json(seminar, { status: 201 });
  } catch (err) {
    console.error("Error creating seminar:", err);
    return NextResponse.json(
      { error: "Failed to create seminar" },
      { status: 500 }
    );
  }
}
