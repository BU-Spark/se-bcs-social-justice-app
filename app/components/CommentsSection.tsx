"use client";

import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";

const CommentsContainer = styled.div`
  margin-top: 16px;
  border-top: 1px solid #ccc;
  padding-top: 8px;
`;

const CommentItem = styled.div`
  margin-bottom: 12px;
  padding: 8px;
  border-bottom: 1px solid #eee;
  display: flex;
  flex-direction: column;
`;

const CommentHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
`;

const CommentProfileImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
`;

const CommentUserName = styled.span`
  font-weight: bold;
  margin-right: 8px;
`;

const CommentTime = styled.span`
  font-size: 12px;
  color: #666;
`;

const CommentContent = styled.p`
  font-size: 14px;
  color: #333;
  margin: 0;
`;

const CommentForm = styled.form`
  display: flex;
  margin-top: 8px;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const CommentButton = styled.button`
  padding: 8px 12px;
  margin-left: 8px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  background-color: green;
  color: white;
  cursor: pointer;
`;

// A small delete button for comments.
const DeleteCommentButton = styled.button`
  background-color: transparent;
  border: none;
  color: red;
  font-size: 12px;
  margin-left: auto;
  cursor: pointer;
`;

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  user: {
    name: string | null;
    imageUrl?: string | null;
    clerkUserId?: string; // ensure the clerkUserId is also returned if available
  };
};

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user: clerkUser } = useUser();
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
    if (!commentInput.trim()) return; // prevent empty submission
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, content: commentInput }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      setCommentInput("");
      fetchComments();
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <CommentsContainer>
      {comments.map((comment) => {
        const formattedTime = new Date(comment.createdAt).toLocaleString(
          "en-US",
          {
            month: "short",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: true,
          }
        );
        return (
          <CommentItem key={comment.id}>
            <CommentHeader>
              <CommentProfileImage
                src={comment.user?.imageUrl || "https://via.placeholder.com/30"}
                alt={comment.user?.name || "Profile"}
              />
              <CommentUserName>
                {comment.user?.name || "Anonymous"}
              </CommentUserName>
              <CommentTime>{formattedTime}</CommentTime>
              {/* If current user is the author of the comment, show a delete button */}
              {clerkUser && comment.user?.clerkUserId === clerkUser.id && (
                <DeleteCommentButton
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Delete
                </DeleteCommentButton>
              )}
            </CommentHeader>
            <CommentContent>{comment.content}</CommentContent>
          </CommentItem>
        );
      })}
      <CommentForm onSubmit={handleCommentSubmit}>
        <CommentInput
          type="text"
          placeholder="Write a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          required
        />
        <CommentButton type="submit">Submit</CommentButton>
      </CommentForm>
    </CommentsContainer>
  );
};

export default CommentsSection;
