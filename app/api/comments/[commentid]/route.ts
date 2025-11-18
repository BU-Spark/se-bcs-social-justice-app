import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function DELETE(
  request: Request,
  context: { params: { commentid: string } },
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { commentid } = context.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentid },
      include: { user: true },
    });

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (comment.user.clerkUserId !== clerkUser.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this comment" },
        { status: 403 },
      );
    }

    await prisma.comment.delete({
      where: { id: commentid },
    });

    return NextResponse.json(
      { message: "Comment deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { error: "Failed to delete comment" },
      { status: 500 },
    );
  }
}
