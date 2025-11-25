import PostReviewQueuePage from "@/app/(authenticated)/admin/posts/page";
import { BannedWordManager } from "@/app/components/BannedWordManager";
import { CommunitiesTable } from "@/app/components/CommunitiesTable";
import { CreateCommunityForm } from "@/app/components/CreateCommunityForm";
import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  try {
    await checkAdmin();
  } catch (error) {
    // Log error for future log recording implementation
    console.error("Admin check failed:", error);
    redirect("/Dashboard");
  }

  const communities = await prisma.community.findMany({
    orderBy: { name: "asc" },
  });

  const bannedWords = await prisma.bannedWord.findMany();

  return (
    <div className="container mx-auto p-4 max-w-5xl space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Create Community</h2>
        <CreateCommunityForm />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Manage Communities</h2>
        <CommunitiesTable communities={communities} />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Content Moderation</h2>
        <BannedWordManager words={bannedWords} />
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-4">Review Flagged Posts</h2>
        <PostReviewQueuePage />
      </section>

    </div>
  );
}
