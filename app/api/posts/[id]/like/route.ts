import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Ensure this exports your PrismaClient instance
import { currentUser } from "@clerk/nextjs/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Get the authenticated Clerk user.
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const postId = params.id;

    // Read the JSON body to get the vote type.
    const body = await request.json();
    const voteType: "UPVOTE" | "DOWNVOTE" = body.type;
    if (voteType !== "UPVOTE" && voteType !== "DOWNVOTE") {
      return NextResponse.json({ error: "Invalid vote type" }, { status: 400 });
    }

    // Look up the current user record from your database by clerkUserId.
    const userRecord = await prisma.user.findUnique({
      where: { clerkUserId: clerkUser.id },
    });
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check whether this user has already voted on this post.
    const existingVote = await prisma.vote.findUnique({
      where: { postId_userId: { postId, userId: userRecord.id } },
    });

    let postScoreDelta = 0;

    if (existingVote) {
      if (existingVote.type === voteType) {
        // If the vote is the same as what the user is trying to cast, remove the vote (undo it).
        postScoreDelta = voteType === "UPVOTE" ? -1 : 1;
        await prisma.vote.delete({
          where: { id: existingVote.id },
        });
      } else {
        // User has already voted in the opposite direction.
        // If switching from UPVOTE to DOWNVOTE, the change is -2 (from +1 to -1).
        // If switching from DOWNVOTE to UPVOTE, the change is +2.
        postScoreDelta = voteType === "UPVOTE" ? 2 : -2;
        await prisma.vote.update({
          where: { id: existingVote.id },
          data: { type: voteType },
        });
      }
    } else {
      // No existing vote: create a new vote record.
      postScoreDelta = voteType === "UPVOTE" ? 1 : -1;
      await prisma.vote.create({
        data: {
          postId,
          userId: userRecord.id,
          type: voteType,
        },
      });
    }

    // Finally, update the post's score according to the vote difference.
    const updatedPost = await prisma.posting.update({
      where: { id: postId },
      data: { score: { increment: postScoreDelta } },
    });

    // Check if the user currently has a vote on the post after the update.
    const currentUserVote = await prisma.vote.findUnique({
      where: { postId_userId: { postId, userId: userRecord.id } },
    });

    return NextResponse.json(
      {
        ...updatedPost,
        currentUserVote: currentUserVote?.type || null, // Attach currentUserVote to the response.
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error updating vote:", error);
    return NextResponse.json(
      { error: "Failed to update vote" },
      { status: 500 }
    );
  }
}
