import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

// GET single course by ID with modules and access check
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = await params;
    const { userId: clerkUserId } = await auth();

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          orderBy: {
            moduleNumber: "asc",
          },
          include: {
            contents: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // If user is not authenticated, return course with no access
    if (!clerkUserId) {
      return NextResponse.json(
        {
          ...course,
          hasAccess: false,
          accessType: "locked",
        },
        { status: 200 },
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        enrollments: {
          where: { courseId: id },
          select: { trialExpiresAt: true },
        },
        subscriptions: {
          where: { isActive: true },
          include: {
            tier: {
              include: {
                coursesUnlocked: {
                  where: { courseId: id },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          ...course,
          hasAccess: false,
          accessType: "locked",
        },
        { status: 200 },
      );
    }

    // Check if user has access via subscription
    const hasViaSubscription = user.subscriptions.some(
      (sub) => sub.tier.coursesUnlocked.length > 0,
    );

    // Check direct enrollment and trial status
    const now = new Date();
    let hasDirectEnrollment = false;
    let isTrialActive = false;
    let trialExpiresAt = null;

    if (user.enrollments.length > 0) {
      const enrollment = user.enrollments[0];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - trialExpiresAt is a new field not yet in types
      if (enrollment.trialExpiresAt === null) {
        // No trial expiration = permanent purchase
        hasDirectEnrollment = true;
      } else {
        // Has trial expiration date
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - trialExpiresAt is a new field not yet in types
        trialExpiresAt = enrollment.trialExpiresAt;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore - trialExpiresAt is a new field not yet in types
        const enrollmentDate =
          enrollment.trialExpiresAt instanceof Date
            ? enrollment.trialExpiresAt
            : new Date(enrollment.trialExpiresAt);
        if (enrollmentDate > now) {
          // Trial still active
          hasDirectEnrollment = true;
          isTrialActive = true;
        } else {
          // Trial expired
          hasDirectEnrollment = false;
          isTrialActive = false;
        }
      }
    }

    const hasAccess = hasDirectEnrollment || hasViaSubscription;

    return NextResponse.json(
      {
        ...course,
        hasAccess,
        accessType: hasAccess
          ? hasViaSubscription
            ? "subscription"
            : isTrialActive
              ? "trial"
              : "purchased"
          : "locked",
        trialExpiresAt: isTrialActive ? trialExpiresAt : null,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
