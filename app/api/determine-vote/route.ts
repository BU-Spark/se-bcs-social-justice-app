import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

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

    const clerkUser = await currentUser();
    let prismaUserId: string | null = null;
    if (clerkUser) {
      const userRecord = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id },
      });
      if (userRecord) {
        prismaUserId = userRecord.id;
      }
    }

    let currentUserVote: "UPVOTE" | "DOWNVOTE" | null = null;
    if (prismaUserId) {
      const vote = await prisma.vote.findUnique({
        where: { postId_userId: { postId, userId: prismaUserId } },
      });
      currentUserVote = vote?.type || null;
    }

    return NextResponse.json({ currentUserVote }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error determining vote:", error);
    return NextResponse.json(
      { error: "Failed to determine vote" },
      { status: 500 },
    );
  }
}
