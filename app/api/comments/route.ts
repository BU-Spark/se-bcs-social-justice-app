import { can } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return NextResponse.json(
        { error: "postId query parameter is required" },
        { status: 400 },
      );
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(comments, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch comments" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { postId, content } = await request.json();
    if (!postId || !content) {
      return NextResponse.json(
        { error: "postId and content are required" },
        { status: 400 },
      );
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const post = await prisma.posting.findUnique({
      where: { id: postId },
      select: { communityId: true },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const hasPermission = await can(
      userRecord.id,
      post.communityId,
      "canComment",
    );

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You do not have permission to comment in this community." },
        { status: 403 },
      );
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        content,
        userId: userRecord.id,
      },
      include: { user: true },
    });

    return NextResponse.json(comment, { status: 200 });
  } catch (error: any) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 },
    );
  }
}
