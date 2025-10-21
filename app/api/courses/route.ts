import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

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
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        enrollments: {
          select: { courseId: true },
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
    const enrolledCourseIds = new Set(
      user.enrollments.map((e: { courseId: string }) => e.courseId),
    );
    const tierUnlockedCourseIds = new Set(
      user.subscriptions.flatMap(
        (sub: { tier: { coursesUnlocked: { courseId: string }[] } }) =>
          sub.tier.coursesUnlocked.map((tc) => tc.courseId),
      ),
    );

    // Add access information to each course
    const coursesWithAccess = courses.map((course) => {
      const hasDirectEnrollment = enrolledCourseIds.has(course.id);
      const hasViaSubscription = tierUnlockedCourseIds.has(course.id);
      const hasAccess = hasDirectEnrollment || hasViaSubscription;

      return {
        ...course,
        hasAccess,
        accessType: hasAccess
          ? hasViaSubscription
            ? "subscription"
            : "purchased"
          : "locked",
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
