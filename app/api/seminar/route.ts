import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import { createZoomMeeting } from "@/lib/zoomApi";
import { fromZonedTime } from "date-fns-tz";

const prisma = new PrismaClient();

// GET all seminars
export async function GET() {
  try {
    const { userId } = await auth();

    let isAdmin = false;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: { role: true },
      });
      isAdmin = user?.role === "admin";
    }

    const seminars = await prisma.seminar.findMany({
      where: isAdmin ? {} : { accessType: "public" }, // member only can access public seminars
      orderBy: { date: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        hostName: true,
        date: true,
        duration: true,
        zoomLink: true,
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
      { status: 500 }
    );
  }
}

// POST: Create new seminar (Admin only)
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

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

    if (!data.title || !data.hostName || !data.date || !data.duration) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    //Check S3 URLs are properly formatted
    if (data.image && !data.image.startsWith("https://")) {
      console.warn("Invalid image URL format:", data.image);
    }
    if (data.mediaUrl && !data.mediaUrl.startsWith("https://")) {
      console.warn("Invalid mediaUrl format:", data.mediaUrl);
    }

    // create zoom meeting
    let zoomLink: string | null = null;
    try {
      const meetingDetails = {
        topic: data.title,
        type: 2, // Scheduled meeting
        start_time: data.date,
        duration: parseInt(data.duration, 10),
        timezone: "America/New_York",
        agenda: data.description || "",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          waiting_room: false,
          auto_recording: "cloud",
        },
      };

      const zoomMeeting = await createZoomMeeting(meetingDetails);
      zoomLink = zoomMeeting?.join_url || null;
    } catch (zoomErr) {
      console.error("⚠️ Zoom meeting creation failed:", zoomErr);
      zoomLink = "Zoom meeting unavailable";
    }

    const utcDate = fromZonedTime(data.date, "America/New_York");

    const seminar = await prisma.seminar.create({
      data: {
        title: data.title,
        description: data.description || "",
        hostName: data.hostName,
        date: utcDate,
        duration: Number(data.duration),
        zoomLink,
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
