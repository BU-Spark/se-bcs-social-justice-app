"use client";

import { useUser } from "@clerk/nextjs";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";
import { FaFilePdf, FaHeart, FaRegHeart } from "react-icons/fa";
import CommentsSection from "./CommentsSection";
import PostForm from "./PostForm";

const StyledContainer = styled.div`
  margin-top: 28px;
  padding: 0 16px;
`;
const StyledSectionHeader = styled.h1`
  color: charcoal;
  font-size: 39px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 24px;
`;
const StyledTopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;
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
const StyledPostCard = styled.div`
  background-color: white;
  border: 1px solid black;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
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
  color: black;
  line-height: 1.5;
  margin: 0;
`;
const StyledPostFooter = styled.div`
  margin-top: 12px;
  display: flex;
  align-items: center;
  font-size: 13px;
  color: silver;
`;
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
  font-size: 18px;
  color: orange;
  margin-right: 16px;
  font-weight: bold;
`;
const StyledLikeButton = styled(StyledButton)`
  background-color: green;
  &:hover {
    background-color: darkgreen;
  }
`;
const StyledDeleteButton = styled(StyledButton)`
  background-color: darkred;
  &:hover {
    background-color: red;
  }
`;
const StyledAttachments = styled.div`
  margin-top: 16px;
  border-top: 1px solid lightgray;
  padding-top: 12px;
`;
const StyledAttachmentHeader = styled.h4`
  font-size: 16px;
  margin-bottom: 8px;
  color: darkgray;
`;
const StyledPdfLink = styled.a`
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: whitesmoke;
  border-radius: 4px;
  width: fit-content;
  color: black;
  text-decoration: none;
  margin: 8px 0;
  &:hover {
    background-color: gainsboro;
  }
`;
const StyledPdfIcon = styled.div`
  width: 30px;
  height: 36px;
  background-color: red;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-right: 8px;
`;
const StyledImageContainer = styled.div`
  margin-top: 16px;
  max-width: 100%;
  overflow: hidden;
`;

type Post = {
  id: string;
  title: string;
  content: string | null;
  createdAt: string;
  score: number;
  imageUrl: string | null;
  pdfUrl: string | null;
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
  const { user: clerkUser, isLoaded: clerkIsLoaded } = useUser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthCheckLoaded, setIsAuthCheckLoaded] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts?communityId=${communityId}&page=${page}&pageSize=10`,
      );
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("Error fetching posts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [communityId, page]);

  const handleDelete = async (postId: string, asAdmin: boolean) => {
    const confirmMessage = asAdmin
      ? "Are you sure you want to delete this post as an admin?"
      : "Are you sure you want to delete your post?";

    if (!confirm(confirmMessage)) return;

    const url = asAdmin ? `/api/admin/posts/${postId}` : `/api/posts/${postId}`;

    try {
      const res = await fetch(url, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete post");
      fetchPosts();
    } catch (error: any) {
      console.error("Error deleting post:", error);
    }
  };

  const handleVote = async (postId: string, type: "UPVOTE" | "DOWNVOTE") => {
    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });
      if (!res.ok) throw new Error("Failed to vote on post");
      fetchPosts();
    } catch (error: any) {
      console.error("Error voting on post:", error);
    }
  };

  const getFilenameFromUrl = (url: string) => {
    const parts = url.split("/");
    let filename = parts[parts.length - 1];
    if (filename.includes("?")) {
      filename = filename.split("?")[0];
    }
    return filename.length > 25 ? filename.substring(0, 22) + "..." : filename;
  };

  const isAuthReady = clerkIsLoaded && isAuthCheckLoaded;
  if (!isAuthReady) {
    return (
      <StyledContainer>
        <p>Loading user data...</p>
      </StyledContainer>
    );
  }

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
        <PostForm
          communityId={communityId}
          onPostCreated={() => {
            fetchPosts();
            setIsFormVisible(false);
          }}
          onCancel={() => setIsFormVisible(false)}
        />
      )}
      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to post!</p>
      ) : (
        posts.map((post) => {
          const formattedDate = new Date(post.createdAt).toLocaleDateString(
            "en-US",
            { month: "long", day: "numeric" },
          );
          const formattedTime = new Date(post.createdAt).toLocaleTimeString(
            "en-US",
            { hour: "numeric", minute: "numeric", hour12: true },
          );
          const currentVote = post.currentUserVote;
          const newVoteType: "UPVOTE" | "DOWNVOTE" =
            !currentVote || currentVote === "DOWNVOTE" ? "UPVOTE" : "DOWNVOTE";
          const buttonText =
            !currentVote || currentVote === "DOWNVOTE" ? "Like" : "Dislike";

          const isAuthor = clerkUser && post.user?.clerkUserId === clerkUser.id;

          return (
            <StyledPostCard key={post.id}>
              <StyledDateTime>
                <StyledProfileImage
                  src={
                    post.user?.imageUrl ||
                    "https://as2.ftcdn.net/v2/jpg/03/31/69/91/1000_F_331699188_lRpvqxO5QRtwOM05gR50ImaaJgBx68vi.jpg"
                  }
                  alt={post.user?.name || "Profile"}
                />
                <span>
                  {formattedDate} at {formattedTime} -{" "}
                  {post.user?.name || "Unknown"}
                </span>
              </StyledDateTime>
              <br />
              <hr />
              <StyledPostTitle>{post.title}</StyledPostTitle>
              <StyledPostContent>{post.content}</StyledPostContent>

              {post.imageUrl && (
                <StyledImageContainer>
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    style={{ maxWidth: "100%", borderRadius: "4px" }}
                  />
                </StyledImageContainer>
              )}

              {post.pdfUrl && (
                <StyledAttachments>
                  <StyledAttachmentHeader>
                    Attached Document:
                  </StyledAttachmentHeader>
                  <StyledPdfLink
                    href={post.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <StyledPdfIcon>
                      <FaFilePdf />
                    </StyledPdfIcon>
                    <span>{getFilenameFromUrl(post.pdfUrl)}</span>
                  </StyledPdfLink>
                </StyledAttachments>
              )}

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
                  {isAuthor && (
                    <StyledDeleteButton
                      onClick={() => handleDelete(post.id, false)}
                      style={{ marginLeft: "auto" }}
                    >
                      Delete
                    </StyledDeleteButton>
                  )}
                  {isAdmin && !isAuthor && (
                    <StyledDeleteButton
                      onClick={() => handleDelete(post.id, true)}
                      style={{ marginLeft: "auto", backgroundColor: "#500724" }}
                    >
                      Delete (Admin)
                    </StyledDeleteButton>
                  )}
                </div>
              </StyledPostFooter>
              <CommentsSection postId={post.id} />
            </StyledPostCard>
          );
        })
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        <StyledButton
          onClick={() => setPage(Math.max(page - 1, 1))}
          disabled={page === 1}
        >
          Previous Page
        </StyledButton>
        <span>
          Page {page} of {totalPages}
        </span>
        <StyledButton
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next Page
        </StyledButton>
      </div>
    </StyledContainer>
  );
};

export default BlogPostsSection;

