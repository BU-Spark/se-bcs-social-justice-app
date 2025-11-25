import { MembersTable } from "@/app/components/MembersTable";
import { checkAdmin } from "@/lib/admin-auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManageMembersPage({
  params,
}: {
  params: { communityId: string };
}) {
  try {
    await checkAdmin();
  } catch (error) {
    // Log error for future log recording implementation
    console.error("Admin check failed:", error);
    redirect("/");
  }

  const { communityId } = await params;
  const community = await prisma.community.findUnique({
    where: { id: communityId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, imageUrl: true },
          },
        },
        orderBy: { user: { name: "asc" } },
      },
    },
  });

  if (!community) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold">Community not found.</h1>
        <Link
          href="/admin/communities"
          className="text-blue-600 hover:underline"
        >
          &larr; Back to Communities Admin Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Link
        href="/admin/communities"
        className="text-sm text-blue-600 hover:underline"
      >
        &larr; Back to Communities Admin Dashboard
      </Link>
      <h1 className="text-3xl font-bold mt-2">Manage Members</h1>
      <h2 className="text-xl text-gray-600 mb-6">
        For community: <strong>{community.name}</strong>
      </h2>

      <MembersTable members={community.members} communityId={community.id} />
    </div>
  );
}
