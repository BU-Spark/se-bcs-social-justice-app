"use client";

import { CommunityMemberStatus, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type MemberWithUser = Prisma.CommunityMembersGetPayload<{
  include: {
    user: {
      select: { id: true; name: true; email: true; imageUrl: true };
    };
  };
}>;

interface MembersTableProps {
  members: MemberWithUser[];
  communityId: string;
}

type ModalAction = "ban" | "unban" | "remove" | null;

export function MembersTable({ members, communityId }: MembersTableProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [modalAction, setModalAction] = useState<ModalAction>(null);

  const filteredMembers = useMemo(() => {
    return members.filter(
      (member) =>
        member.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [members, searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredMembers.map((m) => m.userId)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (userId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(userId)) {
      newSelectedIds.delete(userId);
    } else {
      newSelectedIds.add(userId);
    }
    setSelectedIds(newSelectedIds);
  };

  const isAllFilteredSelected =
    filteredMembers.length > 0 && selectedIds.size === filteredMembers.length;

  const openConfirmationModal = (action: ModalAction) => {
    if (selectedIds.size === 0) return;
    setModalAction(action);
  };

  const handleGroupAction = async () => {
    if (!modalAction || selectedIds.size === 0) return;

    setLoading(true);
    try {
      await fetch(`/api/admin/communities/${communityId}/members/bulk-action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: modalAction,
          userIds: Array.from(selectedIds),
        }),
      });
      setSelectedIds(new Set());
      setModalAction(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to perform group action", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Search members by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
        <div className="flex gap-2">
          <button
            onClick={() => openConfirmationModal("ban")}
            disabled={selectedIds.size === 0}
            className="px-3 py-1 text-sm font-medium rounded-md bg-yellow-600 text-white disabled:opacity-50"
          >
            Ban ({selectedIds.size})
          </button>
          <button
            onClick={() => openConfirmationModal("unban")}
            disabled={selectedIds.size === 0}
            className="px-3 py-1 text-sm font-medium rounded-md bg-green-600 text-white disabled:opacity-50"
          >
            Unban ({selectedIds.size})
          </button>
          <button
            onClick={() => openConfirmationModal("remove")}
            disabled={selectedIds.size === 0}
            className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white disabled:opacity-50"
          >
            Remove ({selectedIds.size})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={isAllFilteredSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMembers.map((member) => (
              <tr
                key={member.userId}
                className={selectedIds.has(member.userId) ? "bg-blue-50" : ""}
              >
                <td className="p-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(member.userId)}
                    onChange={() => handleSelectOne(member.userId)}
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">
                    {member.user.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {member.user.email}
                  </div>
                </td>
                <td className="px-6 py-4">
                  {member.status === CommunityMemberStatus.active ? (
                    <span className="px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Banned
                    </span>
                  )}
                </td>
                <td className="px-6 py-4"></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setModalAction(null)}
        >
          <div
            className="relative p-6 bg-white rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-900">Are you sure?</h3>
            <p className="mt-2 text-sm text-gray-600">
              You are about to <span className="font-bold">{modalAction}</span>{" "}
              <span className="font-bold">{selectedIds.size}</span> member(s).
              This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                onClick={() => setModalAction(null)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                onClick={handleGroupAction}
                disabled={loading}
              >
                {loading ? "Processing..." : `Yes, ${modalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
