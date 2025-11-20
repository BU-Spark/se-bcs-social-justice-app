"use client";

import { Comment } from "@/types/comment";
import { CommunityPermissions } from "@/types/community";
import { useUser } from "@clerk/nextjs";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

const CommentsContainer = styled.div`
  margin-top: 16px;
  padding-top: 0;
`;
const CommentItem = styled.div`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
  &:last-of-type {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;
const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;
const CommentProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
`;
const CommentUserName = styled.span`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-right: 8px;
`;
const CommentTime = styled.span`
  font-size: 12px;
  color: #777;
`;
const CommentContent = styled.p`
  font-size: 15px;
  color: #333;
  margin: 0;
  line-height: 1.6;
`;
const CommentForm = styled.form`
  display: flex;
  margin-top: 16px;
  border-top: 1px solid #f0f0f0;
  padding-top: 16px;
`;
const CommentInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background-color: #f8f9fa;
  &:focus {
    outline: none;
    border-color: #2563eb;
    background-color: white;
  }
`;
const CommentButton = styled.button`
  padding: 10px 16px;
  margin-left: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  background-color: #2563eb;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #1d4ed8;
  }
`;
const DeleteCommentButton = styled.button`
  background-color: transparent;
  border: none;
  color: #dc2626;
  font-size: 12px;
  margin-left: auto;
  cursor: pointer;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
`;

interface CommentsSectionProps {
  postId: string;
  permissions: CommunityPermissions;
  onCommentPosted: () => void;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  postId,
  permissions,
  onCommentPosted,
}) => {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data: Comment[] = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: commentInput }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setCommentInput("");
      fetchComments();
      onCommentPosted();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentid: string, asAdmin: boolean) => {
    const confirmMessage = asAdmin
      ? "Are you sure you want to delete this comment as an Admin?"
      : "Are you sure you want to delete this comment?";
    if (!confirm(`${confirmMessage}`)) return;

    const url = asAdmin
      ? `/api/admin/comments/${commentid}`
      : `/api/comments/${commentid}`;
    try {
      const res = await fetch(`${url}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete comment");
      setComments((prev) => prev.filter((c) => c.id !== commentid));
      onCommentPosted();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isAuthReady = clerkIsLoaded;
  if (!isAuthReady) {
    return (
      <CommentsContainer>
        <p>Loading user data...</p>
      </CommentsContainer>
    );
  }
  return (
    <CommentsContainer>
      {comments.map((comment) => {
        const isCommenter = clerkUser && comment.user?.clerkUserId === clerkUser.id;
        const formattedTime = new Date(comment.createdAt).toLocaleString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          },
        );
        return (
          <CommentItem key={comment.id}>
            <CommentHeader>
              <CommentProfileImage
                src={comment.user?.imageUrl || "/default-avatar.png"}
                alt={comment.user?.name || "Profile"}
              />
              <CommentUserName>
                {comment.user?.name || "Anonymous"}
              </CommentUserName>
              <CommentTime>{formattedTime}</CommentTime>
              {(permissions.canModerate ||
                (isCommenter && permissions.canComment)) && (
                <DeleteCommentButton
                  onClick={() =>
                    handleDeleteComment(comment.id, permissions.canModerate)
                  }
                >
                  Delete
                </DeleteCommentButton>
              )}
            </CommentHeader>
            <CommentContent>{comment.content}</CommentContent>
          </CommentItem>
        );
      })}
      {permissions.canComment && (
        <CommentForm onSubmit={handleCommentSubmit}>
          <CommentInput
            type="text"
            placeholder="Write a comment..."
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            required
          />
          <CommentButton type="submit">Post</CommentButton>
        </CommentForm>
      )}
    </CommentsContainer>
  );
};

export default CommentsSection;
