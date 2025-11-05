"use client";

import { useUser } from "@clerk/nextjs";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

const CommentsContainer = styled.div`
  margin-top: 16px;
  border-top: 1px solid silver;
  padding-top: 8px;
`;

const CommentItem = styled.div`
  margin-bottom: 12px;
  padding: 8px;
  border-bottom: 1px solid light gray;
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
  color: gray;
`;

const CommentContent = styled.p`
  font-size: 14px;
  color: charcoal;
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
  border: 1px solid gray;
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
    clerkUserId?: string;
  };
};

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ postId }) => {
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const [isAdmin,setIsAdmin] = useState(false);
  const [isAuthCheckLoaded,setIsAuthCheckLoaded] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const res = await fetch("/api/check-admin");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.isAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Failed to check admin status", error);
        setIsAdmin(false);
      } finally {
        setIsAuthCheckLoaded(true);
      }
    };

    checkAdminStatus();
  }, []);

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
      const res = await fetch(`${url}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete comment");

      setComments((prevComments) =>
        prevComments.filter((c) => c.id !== commentid),
      );
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isAuthReady = clerkIsLoaded && isAuthCheckLoaded;
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
        const isCommenter =
          clerkUser && comment.user?.clerkUserId === clerkUser.id;
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
                src={
                  comment.user?.imageUrl ||
                  "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg"
                }
                alt={comment.user?.name || "Profile"}
              />
              <CommentUserName>
                {comment.user?.name || "Anonymous"}
              </CommentUserName>
              <CommentTime>{formattedTime}</CommentTime>
              {isCommenter && (
                <DeleteCommentButton
                  onClick={() => handleDeleteComment(comment.id, false)}
                >
                  Delete
                </DeleteCommentButton>
              )}
              {isAdmin && !isCommenter && (
                <DeleteCommentButton
                  onClick={() => handleDeleteComment(comment.id, true)}
                >
                  Delete(Admin)
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
