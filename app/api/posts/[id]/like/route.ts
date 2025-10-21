import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const postId = params.id;

    const body = await request.json();
    const voteType: "UPVOTE" | "DOWNVOTE" = body.type;
    if (voteType !== "UPVOTE" && voteType !== "DOWNVOTE") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    const userRecord = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existingVote = await prisma.vote.findUnique({
      where: { postId_userId: { postId, userId: userRecord.id } },
    });

    let postScoreDelta = 0;

    if (existingVote) {
      if (existingVote.type === voteType) {
        postScoreDelta = voteType === "UPVOTE" ? -1 : 1;
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        postScoreDelta = voteType === "UPVOTE" ? 2 : -2;
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: voteType },
        });
      }
    } else {
      postScoreDelta = voteType === "UPVOTE" ? 1 : -1;
      await prisma.vote.create({
        data: {
          postId,
          userId: userRecord.id,
          type: voteType,
        },
      });
    }

    const updatedPost = await prisma.posting.update({
      where: { id: postId },
      data: { score: { increment: postScoreDelta } },
    });

    const currentUserVote = await prisma.vote.findUnique({
      where: { postId_userId: { postId, userId: userRecord.id } },
    });

    return NextResponse.json(
      {
        ...updatedPost,
        currentUserVote: currentUserVote?.type || null,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Failed to update vote" },
      { status: 500 },
    );
  }
}
