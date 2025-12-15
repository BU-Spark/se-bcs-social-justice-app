import { ReviewPostsTable } from "@/app/components/ReviewPostsTable";
import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { PostingStatus } from "@prisma/client";
import { redirect } from "next/navigation";
export default async function PostReviewQueuePage() {
  try {
    await checkAdmin();
  } catch (error) {
    // Log error for future log recording implementation
    console.error("Admin check failed:", error);
    redirect("/app/(authenticated)/dashboard");
  }

  const flaggedPosts = await prisma.posting.findMany({
    where: { status: PostingStatus.flagged },
    include: {
      user: { select: { name: true } },
      community: { select: { name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const bannedWords = await prisma.bannedWord.findMany();

  return (
    <div className="container mx-auto py-2 max-w-5xl space-y-8">
      <p className="text-gray-600">
        These were flagged for review based off Banned word List. Approve them
        to make them public(visible), or delete them(forever).
      </p>
      <ReviewPostsTable posts={flaggedPosts} bannedWords={bannedWords} />
    </div>
  );
}
