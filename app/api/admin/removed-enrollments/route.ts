import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET endpoint to fetch all removed enrollments (admin only)
export async function GET(request: Request) {
  try {
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

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const userId = searchParams.get("userId");

    // Build where clause
    const where: any = {};
    if (courseId) {
      where.courseId = courseId;
    }
    if (userId) {
      where.userId = userId;
    }

    // Fetch removed enrollments with related data
    const removedEnrollments = await prisma.removedEnrollment.findMany({
      where,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        removedAt: "desc", // Most recent removals first
      },
    });

    // Fetch admin names for removedBy fields
    const adminIds = [...new Set(removedEnrollments.map((e) => e.removedBy))];
    const admins = await prisma.user.findMany({
      where: {
        id: { in: adminIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    const adminMap = new Map(admins.map((admin) => [admin.id, admin]));

    // Add admin info to each removed enrollment
    const enrichedEnrollments = removedEnrollments.map((enrollment) => ({
      ...enrollment,
      removedByAdmin: adminMap.get(enrollment.removedBy) || null,
    }));

    return NextResponse.json(
      { removedEnrollments: enrichedEnrollments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching removed enrollments:", error);
    return NextResponse.json(
      { error: "Failed to fetch removed enrollments" },
      { status: 500 }
    );
  }
}

