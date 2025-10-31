import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

// GET single course by ID with modules and access check
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
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
        { status: 200 }
      );
    }

    // Find the user in the database
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      include: {
        enrollments: {
          where: { courseId: id },
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
        { status: 200 }
      );
    }

    // Check if user has access
    const hasDirectEnrollment = user.enrollments.length > 0;
    const hasViaSubscription = user.subscriptions.some(
      (sub) => sub.tier.coursesUnlocked.length > 0
    );
    const hasAccess = hasDirectEnrollment || hasViaSubscription;

    return NextResponse.json(
      {
        ...course,
        hasAccess,
        accessType: hasAccess
          ? hasViaSubscription
            ? "subscription"
            : "purchased"
          : "locked",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}
