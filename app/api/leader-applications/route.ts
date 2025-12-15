import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import type { LeaderApplicationStatus } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let localUser = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });

    if (!localUser) {
      localUser = await prisma.user.create({
        data: {
          clerkUserId: clerkUser.id,
          email: clerkUser.emailAddresses?.[0]?.emailAddress || "",
          name: clerkUser.fullName || "",
        },
      });
    }

    const existingApp = await prisma.leaderApplication.findUnique({
      where: { userId: localUser.id },
    });

    if (existingApp) {
      return NextResponse.json(
        { error: "Leader application already submitted." },
        { status: 400 },
      );
    }

    const leaderApp = await prisma.leaderApplication.create({
      data: {
        userId: localUser.id,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        currentlyInvolved: body.currentlyInvolved,
        background: body.background,
        hasLedGroup: body.hasLedGroup,
        previousRole: body.previousRole,
        focusTopics: body.focusTopics,
        motivation: body.motivation,
        leadershipStyle: body.leadershipStyle,
        inclusiveEnvironment: body.inclusiveEnvironment,
        conflictHandling: body.conflictHandling,
        comfortableWithTopics: body.comfortableWithTopics,
        engagementStrategies: body.engagementStrategies,
        meetingFrequency: body.meetingFrequency,
        availableForOnboarding: body.availableForOnboarding,
        willFollowGuidelines: body.willFollowGuidelines,
        questions: body.questions,
        referenceName: body.referenceName,
        referenceContact: body.referenceContact,
        referenceRelationship: body.referenceRelationship,
        videoUrl: body.videoUrl,
      },
    });

    return NextResponse.json(
      { message: "Leader application submitted successfully.", leaderApp },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error submitting leader application:", error);
    return NextResponse.json(
      { error: "Failed to submit leader application." },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  try {
    // First check if user is authenticated and is an admin
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (!dbUser || dbUser.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Process the request after authentication check
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const validStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
    const whereClause =
      status && status !== "ALL" && validStatuses.includes(status as any)
        ? { status: status as LeaderApplicationStatus }
        : {};

    const applications = await prisma.leaderApplication.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Error fetching applications" },
      { status: 500 },
    );
  }
}
