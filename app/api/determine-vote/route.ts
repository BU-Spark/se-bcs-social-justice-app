// app/api/determinevote/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db"; // Ensure your PrismaClient instance is exported from here
import { currentUser } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  try {
    // Extract the "postId" from the query parameters
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) {
      return NextResponse.json(
        { error: "postId query parameter is required" },
        { status: 400 }
      );
    }

    // Get the currently authenticated Clerk user, if any.
    const clerkUser = await currentUser();
    let prismaUserId: string | null = null;
    if (clerkUser) {
      // Look up the corresponding user record in your database by clerkUserId.
      const userRecord = await prisma.user.findUnique({
        where: { clerkUserId: clerkUser.id },
      });
      if (userRecord) {
        prismaUserId = userRecord.id;
      }
    }

    // If we have a user in our database, attempt to find their vote for the given post.
    let currentUserVote: "UPVOTE" | "DOWNVOTE" | null = null;
    if (prismaUserId) {
      const vote = await prisma.vote.findUnique({
        where: { postId_userId: { postId, userId: prismaUserId } },
      });
      currentUserVote = vote?.type || null;
    }

    return NextResponse.json({ currentUserVote }, { status: 200 });
  } catch (error: any) {
    console.error("Error determining vote:", error);
    return NextResponse.json(
      { error: "Failed to determine vote" },
      { status: 500 }
    );
  }
}
