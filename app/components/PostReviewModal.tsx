"use client";

import { Prisma } from "@prisma/client";
import { useMemo } from "react";

type PostWithDetails = Prisma.PostingGetPayload<{
  include: {
    user: { select: { name: true } };
    community: { select: { name: true } };
  };
}>;

interface PostReviewModalProps {
  post: PostWithDetails;
  bannedWords: string[];
  onClose: () => void;
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightBannedWords(text: string | null, bannedWords: string[]) {
  if (!text) return text;

  const regex = new RegExp(`(${bannedWords.join("|")})`, "gi");
  const parts = text.split(regex);

  return parts.map((part, index) =>
    bannedWords.some(word => word.toLowerCase() === part.toLowerCase()) ? (
      <mark key={index} className="bg-yellow-300 ">{part}</mark>
    ) : (
      part
    )
  );
}


export function PostReviewModal({
  post,
  bannedWords,
  onClose,
}: PostReviewModalProps) {
  
  const highlightedTitle = useMemo(
    () => highlightBannedWords(post.title, bannedWords),
    [post.title, bannedWords],
  );

  const highlightedContent = useMemo(
    () => highlightBannedWords(post.content, bannedWords),
    [post.content, bannedWords]
  );

  return (
    //backdrop modal
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose} // closes the modal on backdrop click
    > 
      <div
        className="relative p-6 bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} // Prevent closing on modal click
      >
        <div className="flex justify-between items-center pb-3 border-b">
          <h3 className="text-xl font-bold text-gray-900">Review Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            &times;
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <span className="block text-sm font-medium text-gray-500">Author</span>
            <p className="text-gray-800">{post.user.name}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Community</span>
            <p className="text-gray-800">{post.community.name}</p>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Title</span>
            <div className="text-lg font-semibold text-gray-900">
              {highlightedTitle}
            </div>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-500">Content</span>
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap">
              {highlightedContent}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}