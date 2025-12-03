import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id: courseId } = await params;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if enrollment exists - include user info to store
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    // Create a record of this removal before deleting
    // Store user info so it persists even if user is deleted later
    await prisma.removedEnrollment.create({
      data: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        userName: enrollment.user?.name || null,
        userEmail: enrollment.user?.email || null,
        originalEnrollmentDate: enrollment.enrollmentDate,
        completionStatusAtRemoval: enrollment.completionStatus,
        trialExpiresAt: enrollment.trialExpiresAt,
        removedBy: dbUser.id, // Track which admin removed the enrollment
        // reason can be added later if you want to capture it from request body
      },
    });

    // Delete the enrollment - this removes access
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json(
      { 
        message: "User removed from course successfully",
        removedEnrollment: {
          userId,
          courseId,
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing enrollment:", error);
    return NextResponse.json(
      { error: "Failed to remove user from course" },
      { status: 500 }
    );
  }
}