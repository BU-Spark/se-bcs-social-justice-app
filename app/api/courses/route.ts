import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// POST endpoint to start a 7-day free trial for a course
export async function POST(request: Request) {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 },
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user already has enrollment for this course
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: courseId,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Already enrolled in this course" },
        { status: 400 },
      );
    }

    // Calculate trial expiration date (7 days from now)
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

    // Create enrollment with trial expiration
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - trialExpiresAt is a new field not yet in types
    const enrollment = await prisma.userCourse.create({
      data: {
        userId: user.id,
        courseId: courseId,
        trialExpiresAt: trialExpiresAt,
        completionStatus: "not_started",
      },
    });

    return NextResponse.json(
      {
        message: "7-day free trial started successfully",
        enrollment,
        trialExpiresAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error starting trial:", error);
    return NextResponse.json(
      { error: "Failed to start trial" },
      { status: 500 },
    );
  }
}

// GET all courses with access information
export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();

    const courses = await prisma.course.findMany({
      include: {
        modules: {
          orderBy: {
            moduleNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // If user is not authenticated, return courses without access info
    if (!clerkUserId) {
      const coursesWithAccess = courses.map((course) => ({
        ...course,
        hasAccess: false,
        accessType: "locked",
      }));
      return NextResponse.json(coursesWithAccess, { status: 200 });
    }

    // Find the user in the database
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - trialExpiresAt is a new field not yet in types
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        enrollments: {
          select: { courseId: true, trialExpiresAt: true },
        },
        subscriptions: {
          where: { isActive: true },
          include: {
            tier: {
              include: {
                coursesUnlocked: {
                  select: { courseId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      const coursesWithAccess = courses.map((course) => ({
        ...course,
        hasAccess: false,
        accessType: "locked",
      }));
      return NextResponse.json(coursesWithAccess, { status: 200 });
    }

    // Get all course IDs the user has access to
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - user includes enrollments and subscriptions from include
    const enrolledCourses = new Map(
      user.enrollments.map(
        (e: { courseId: string; trialExpiresAt: Date | null }) => [
          e.courseId,
          e.trialExpiresAt,
        ],
      ),
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - user includes enrollments and subscriptions from include
    const tierUnlockedCourseIds = new Set(
      user.subscriptions.flatMap(
        (sub: { tier: { coursesUnlocked: { courseId: string }[] } }) =>
          sub.tier.coursesUnlocked.map((tc) => tc.courseId),
      ),
    );

    // Add access information to each course
    const coursesWithAccess = courses.map((course) => {
      const enrollment = enrolledCourses.get(course.id);
      const hasViaSubscription = tierUnlockedCourseIds.has(course.id);

      // Check if trial has expired
      let hasDirectEnrollment = false;
      let isTrialActive = false;
      let trialExpiresAt = null;

      if (enrollment !== undefined) {
        if (enrollment === null) {
          // No trial expiration = permanent access
          hasDirectEnrollment = true;
        } else {
          // Has trial expiration date
          trialExpiresAt = enrollment;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - enrollment is a Date from the database
          const enrollmentDate =
            enrollment instanceof Date ? enrollment : new Date(enrollment);
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

      return {
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
      };
    });

    return NextResponse.json(coursesWithAccess, { status: 200 });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
