"use client";

import { Community } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommunitiesTable({
  communities,
}: {
  communities: Community[];
}) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleDelete = async (communityId: string, communityName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${communityName}"? This is irreversible.`,
      )
    ) {
      return;
    }

    setLoadingId(communityId);
    try {
      await fetch(`/api/admin/communities/${communityId}`, {
        method: "DELETE",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to delete community", error);
      alert("Failed to delete community.");
      setLoadingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-lg border shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 bg-white">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Type
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {communities.map((community) => (
            <tr key={community.id}>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {community.name}
              </td>
              <td className="px-6 py-4 text-sm text-gray-500">
                {community.type}
              </td>
              <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                <Link
                  href={`/admin/communities/${community.id}/members`}
                  className="text-white rounded bg-blue-600 p-2 hover:bg-blue-900"
                >
                  Manage Members
                </Link>
                <button
                  onClick={() => handleDelete(community.id, community.name)}
                  disabled={loadingId === community.id}
                  className="text-white rounded p-2 bg-red-600 hover:bg-red-900 disabled:opacity-50"
                >
                  {loadingId === community.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
