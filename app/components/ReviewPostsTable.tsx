"use client";

import { PostReviewModal } from "@/app/components/PostReviewModal";
import { BannedWord, Prisma } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type PostWithDetails = Prisma.PostingGetPayload<{
  include: {
    user: { select: { name: true } };
    community: { select: { name: true } };
  };
}>;

type ModalAction = "approve" | "delete" | null;

interface ReviewPostsTableProps {
  posts: PostWithDetails[];
  bannedWords: BannedWord[];
}

export function ReviewPostsTable({
  posts,
  bannedWords,
}: ReviewPostsTableProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [loading, setLoading] = useState<boolean | undefined>(false);

  const [selectedPost, setSelectedPost] = useState<PostWithDetails | null>(
    null,
  );

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(posts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };


  const handleSelectOne = (postId: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(postId)) {
      newSelectedIds.delete(postId);
    } else {
      newSelectedIds.add(postId);
    }
    setSelectedIds(newSelectedIds);
  };

  const isAllSelected = posts.length > 0 && selectedIds.size === posts.length;

  const openConfirmationModal = (action: ModalAction) => {
    if (selectedIds.size === 0) return;
    setModalAction(action);
  };

  const handleBulkAction = async () => {
    if (!modalAction || selectedIds.size === 0 ) return;
    setLoading(true);
    try {
      await fetch(`/api/admin/posts/bulk-actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: modalAction,
          postIds: Array.from(selectedIds),
        }),
      });

      setSelectedIds(new Set());
      setModalAction(null);
      router.refresh();
    } catch ( error ) {
      console.error("Failed to perform the bulk action", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  if (posts.length === 0) {
    return <p className="text-gray-500">The review queue is empty!</p>;
  }

  const wordList = bannedWords.map((bw) => bw.word);
  return (
     <>
      <div className="mb-4 flex justify-end items-center gap-2">
        <span className="text-sm text-gray-600">
          {selectedIds.size} selected
        </span>
        <button
          onClick={() => openConfirmationModal("approve")}
          disabled={selectedIds.size === 0 || loading}
          className="px-3 py-1 text-sm font-medium rounded-md bg-green-600 text-white disabled:opacity-50"
        >
          Approve Selected
        </button>
        <button
          onClick={() => openConfirmationModal("delete")}
          disabled={selectedIds.size === 0 || loading}
          className="px-3 py-1 text-sm font-medium rounded-md bg-red-600 text-white disabled:opacity-50"
        >
          Delete Selected
        </button>
      </div>
      {/* Table of flagged Posts*/}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 bg-white">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Post
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Community
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {posts.map((post) => (
              <tr
                key={post.id}
                className={selectedIds.has(post.id) ? "bg-blue-50" : ""}
              >
                <td className="p-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(post.id)}
                    onChange={() => handleSelectOne(post.id)}
                  />
                </td>
                <td className="px-6 py-4" onClick={() => setSelectedPost(post)}>
                  <div className="text-sm font-medium text-gray-900">
                    {post.title}
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {post.content}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {post.user.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {post.community.name}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* confirmation modal */}
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
              <span className="font-bold">{selectedIds.size}</span> post(s).
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
                onClick={handleBulkAction}
                disabled={loading}
              >
                {loading ? "Processing..." : `Yes, ${modalAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Shows popup of post when clicked */}
      {selectedPost && (
        <PostReviewModal
          post={selectedPost}
          bannedWords={wordList}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </>
  );
}
