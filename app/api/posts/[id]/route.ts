import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const comments = await prisma.comment.findMany({
      where: { postId: params.id },
      select: { id: true },
    });

    const likes = await prisma.vote.findMany({
      where: { postId: params.id },
      select: { id: true },
    });

    if (likes.length > 0) {
      await prisma.vote.deleteMany({
        where: { postId: params.id },
      });
    }

    if (comments.length > 0) {
      await prisma.comment.deleteMany({
        where: { postId: params.id },
      });
    }

    const deletedPost = await prisma.posting.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      {
        ...deletedPost,
        deletedCommentsCount: comments.length,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Failed to delete post" },
      { status: 500 },
    );
  }
}
