import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
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

    const courseId = params.id;
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Delete the enrollment
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: userId,
          courseId: courseId,
        },
      },
    });

    return NextResponse.json(
      { message: "User removed from course successfully" },
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