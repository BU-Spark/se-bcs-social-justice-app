"use client";

import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import CommentsSection from "./CommentsSection";

const StyledContainer = styled.div`
  margin-top: 28px;
  padding: 0 16px;
`;

const StyledSectionHeader = styled.h1`
  text-align: center;
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 24px;
  color: #333;
`;

const StyledTopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const StyledPostFormContainer = styled.div`
  padding: 16px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: silver;
  margin-bottom: 24px;
`;

const StyledPostCard = styled.div`
  border: 1px solid black;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background-color: white;
  display: flex;
  flex-direction: column;
  text-align: left;
`;

const StyledPostTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 28px;
  font-weight: bold;
`;

const StyledPostContent = styled.p`
  font-size: 16px;
  color: #444;
  line-height: 1.5;
  margin: 0;
`;

// Footer contains a single row where the vote controls and delete button reside.
const StyledPostFooter = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #999;
`;

// This row displays the date/time with profile image.
const StyledDateTime = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const StyledProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
`;

const StyledLikes = styled.span`
  font-size: 14px;
  color: #ff4500;
  margin-right: 16px;
  font-weight: bold;
`;

// Base button style.
const StyledButton = styled.button`
  padding: 12px 20px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  margin-right: 8px;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: red;
  }
`;

const StyledLikeButton = styled(StyledButton)`
  background-color: green;
  &:hover {
    background-color: darkgreen;
  }
`;

// Delete button styling (exactly as originally provided).
const StyledDeleteButton = styled(StyledButton)`
  background-color: darkred;
  &:hover {
    background-color: red;
  }
`;

const StyledInput = styled.input`
  padding: 8px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 8px;
`;

const StyledTextarea = styled.textarea`
  padding: 8px;
  font-size: 16px;
  width: 100%;
  margin-bottom: 8px;
  resize: vertical;
`;

// Extend Post type to include currentUserVote.
type Post = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  score: number;
  // This property should be provided by your API for each post.
  currentUserVote?: "UPVOTE" | "DOWNVOTE" | null;
  user?: {
    id: string;
    clerkUserId: string;
    name: string | null;
    imageUrl?: string | null;
  };
};

interface BlogPostsSectionProps {
  communityId: string;
}

const BlogPostsSection: React.FC<BlogPostsSectionProps> = ({ communityId }) => {
  const { user: clerkUser } = useUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?communityId=${communityId}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data: Post[] = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId, title, content }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create post");
      }
      setTitle("");
      setContent("");
      setIsFormVisible(false);
      fetchPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
      setError(error.message);
    }
  };

  const handleDelete = async (postId: string) => {
    console.log("Attempting to delete post:", postId);
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        console.error("Delete request failed with status", res.status);
        throw new Error("Failed to delete post");
      }
      console.log("Post deleted successfully");
      fetchPosts();
    } catch (error: any) {
      console.error("Error deleting post:", error);
    }
  };

  // The vote button logic:
  // - If currentUserVote is null or "DOWNVOTE", display "Like" (and send UPVOTE)
  // - If currentUserVote is "UPVOTE", display "Dislike" (and send DOWNVOTE)
  const handleVote = async (postId: string, type: "UPVOTE" | "DOWNVOTE") => {
    console.log(
      `Attempting to ${type === "UPVOTE" ? "like" : "dislike"} post:`,
      postId
    );
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) {
        console.error("Vote request failed with status", res.status);
        throw new Error("Failed to vote on post");
      }
      console.log("Vote successful");
      fetchPosts();
    } catch (error: any) {
      console.error("Error voting on post:", error);
    }
  };

  return (
    <StyledContainer>
      <StyledSectionHeader>Community Posts</StyledSectionHeader>
      <StyledTopBar>
        <h3>Create a post!</h3>
        <StyledButton onClick={() => setIsFormVisible(!isFormVisible)}>
          {isFormVisible ? "Cancel" : "Write a Post"}
        </StyledButton>
      </StyledTopBar>
      {isFormVisible && (
        <StyledPostFormContainer>
          <form onSubmit={handleSubmit}>
            <StyledInput
              type="text"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <StyledTextarea
              placeholder="Write your post content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
            />
            <StyledButton type="submit">Post</StyledButton>
            {error && <p style={{ color: "red" }}>{error}</p>}
          </form>
        </StyledPostFormContainer>
      )}
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => {
          const formattedDate = new Date(post.createdAt).toLocaleDateString(
            "en-US",
            {
              month: "long",
              day: "numeric",
            }
          );
          const formattedTime = new Date(post.createdAt).toLocaleTimeString(
            "en-US",
            {
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }
          );

          const currentVote = post.currentUserVote;
          const newVoteType: "UPVOTE" | "DOWNVOTE" =
            !currentVote || currentVote === "DOWNVOTE" ? "UPVOTE" : "DOWNVOTE";
          const buttonText =
            !currentVote || currentVote === "DOWNVOTE" ? "Like" : "Dislike";

          return (
            <StyledPostCard key={post.id}>
              <StyledDateTime>
                {post.user?.imageUrl && (
                  <StyledProfileImage
                    src={
                      post.user.imageUrl ||
                      "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg"
                    }
                    alt={post.user.name || "Profile"}
                  />
                )}
                <span>
                  {formattedDate} at {formattedTime} -{" "}
                  {post.user?.name || "Unknown"}
                </span>
              </StyledDateTime>
              <br />
              <hr />
              <StyledPostTitle>{post.title}</StyledPostTitle>
              <StyledPostContent>{post.content}</StyledPostContent>
              <StyledPostFooter>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  {post.currentUserVote === "UPVOTE" ? (
                    <FaHeart color="red" style={{ marginRight: "8px" }} />
                  ) : (
                    <FaRegHeart style={{ marginRight: "8px" }} />
                  )}
                  <StyledLikes>{post.score} Likes</StyledLikes>
                  <StyledLikeButton
                    onClick={() => handleVote(post.id, newVoteType)}
                  >
                    {buttonText}
                  </StyledLikeButton>
                  {clerkUser && post.user?.clerkUserId === clerkUser.id && (
                    <StyledDeleteButton
                      onClick={() => handleDelete(post.id)}
                      style={{ marginLeft: "auto" }}
                    >
                      Delete
                    </StyledDeleteButton>
                  )}
                </div>
              </StyledPostFooter>
              <CommentsSection postId={post.id} />
            </StyledPostCard>
          );
        })
      )}
    </StyledContainer>
  );
};

export default BlogPostsSection;
