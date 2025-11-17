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
    let userCommunityIds: string[] = [];
    let userTierIds: string[] = [];

    if (userId) {
      // Fetch user info
      const user = await prisma.user.findUnique({
        where: { clerkUserId: userId },
        select: {
          id: true,
          role: true,
          memberships: { select: { communityId: true } },
          subscriptions: {
            select: {
              tierId: true,
            },
          },
        },
      });

      if (user) {
        isAdmin = user.role === "admin";
        userCommunityIds = user.memberships.map((m) => m.communityId);
        userTierIds = user.subscriptions.map((s) => s.tierId);
      }
    }

    // Fetch all seminars with access rules
    const seminars = await prisma.seminar.findMany({
      orderBy: { date: "asc" },
      include: {
        accessRules: {
          include: {
            community: { select: { id: true, name: true } },
            tier: { select: { id: true, tierName: true } },
          },
        },
      },
    });

    // check seminar is locked for the user based on access rules
    const seminarsWithLockStatus = seminars.map((seminar) => {
      let locked = true;

      // Admins have access
      if (isAdmin) return { ...seminar, locked: false };

      for (const rule of seminar.accessRules) {
        if (rule.accessScope === "public") {
          locked = false;
          break;
        }

        // Community
        if (
          rule.accessScope === "community" &&
          rule.communityId &&
          userCommunityIds.includes(rule.communityId)
        ) {
          locked = false;
          break;
        }

        // membership tier rule
        if (
          rule.accessScope === "membership" &&
          rule.tierId &&
          userTierIds.includes(rule.tierId)
        ) {
          locked = false;
          break;
        }
      }
      return { ...seminar, locked };
    });

    return NextResponse.json(seminarsWithLockStatus);
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
        image: data.image || null,
        mediaUrl: data.mediaUrl || null,
      },
    });

    // add access rules, public by default
    if (data.accessRules && Array.isArray(data.accessRules)) {
      for (const rule of data.accessRules) {
        const parsedPrice =
          rule.price && !isNaN(parseFloat(rule.price))
            ? parseFloat(rule.price)
            : null;

        await prisma.seminarAccessRule.create({
          data: {
            seminarId: seminar.id,
            accessScope: rule.accessScope,
            communityId: rule.communityId || null,
            tierId: rule.tierId || null,
            price: parsedPrice,
          },
        });
      }
    } else {
      await prisma.seminarAccessRule.create({
        data: {
          seminarId: seminar.id,
          accessScope: "public",
        },
      });
    }

    return NextResponse.json(seminar, { status: 201 });
  } catch (err) {
    console.error("Error creating seminar:", err);
    return NextResponse.json(
      { error: "Failed to create seminar" },
      { status: 500 }
    );
  }
}
