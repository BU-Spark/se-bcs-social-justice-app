"use client";

import { CommunityPermissions } from "@/types/community";
import { Post } from "@/types/posts";
import { useUser } from "@clerk/nextjs";
import styled from "@emotion/styled";
import React, { useEffect, useState } from "react";

import {
  FaFilePdf,
  FaHeart,
  FaRegCommentAlt,
  FaRegHeart,
} from "react-icons/fa";

const StyledContainer = styled.div`
  padding: 0;
`;

const StyledButton = styled.button`
  padding: 10px 16px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #1d4ed8;
  }
  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
  }
`;

const StyledPostCard = styled.div`
  background-color: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  margin-bottom: 16px;
  text-align: left;
  cursor: pointer;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
`;

const StyledPostHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px 12px;
`;

const StyledProfileImage = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 12px;
`;

const StyledAuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledAuthorName = styled.span`
  font-weight: 600;
  color: #333;
  font-size: 15px;
`;

const StyledDateTime = styled.span`
  font-size: 13px;
  color: #777;
`;

const StyledPostContentContainer = styled.div`
  padding: 0 20px 16px;
`;

const StyledPostTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #111;
`;

const StyledPostContent = styled.p`
  font-size: 16px;
  color: #333;
  line-height: 1.6;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3; 
  -webkit-box-orient: vertical;
  */
`;

const StyledImageContainer = styled.div`
  max-width: 100%;
  overflow: hidden;
  max-height: 500px;
`;

const StyledPostFooter = styled.div`
  margin-top: 12px;
  padding: 8px 20px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  color: #555;
`;

const StyledIconButton = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #555;
  padding: 6px 8px;
  border-radius: 6px;
  transition: background-color 0.2s;

  &:hover {
    background-color: #f4f4f4;
  }

  &.liked {
    color: #ef4444;
  }
`;

const StyledFooterActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledDeleteButton = styled.button`
  padding: 6px 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  margin-left: auto;
  transition: background-color 0.2s;
  &:hover {
    background-color: #b91c1c;
  }
`;

const StyledAttachments = styled.div`
  margin-top: 16px;
  padding-top: 12px;
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
interface BlogPostsSectionProps {
  communityId: string;
  permissions: CommunityPermissions;
  onPostSelect: (post: Post) => void;
}

const BlogPostsSection: React.FC<BlogPostsSectionProps> = ({
  communityId,
  permissions,
  onPostSelect,
}) => {
  const { user: clerkUser } = useUser();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

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
      setError("Error fetching posts.");
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

  return (
    <StyledContainer>
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
          const isAuthor = clerkUser && post.user?.clerkUserId === clerkUser.id;
          const isLiked = currentVote === "UPVOTE";

          return (
            <StyledPostCard key={post.id} onClick={() => onPostSelect(post)}>
              <StyledPostHeader>
                <StyledProfileImage
                  src={post.user?.imageUrl || undefined} //replace with default image url later
                  alt={post.user?.name || "Profile"}
                />
                <StyledAuthorInfo>
                  <StyledAuthorName>
                    {post.user?.name || "Unknown"}
                  </StyledAuthorName>
                  <StyledDateTime>
                    {formattedDate} at {formattedTime}
                  </StyledDateTime>
                </StyledAuthorInfo>
              </StyledPostHeader>

              {post.imageUrl && (
                <StyledImageContainer>
                  <img
                    src={post.imageUrl}
                    alt="Post attachment"
                    style={{ width: "100%", display: "block" }}
                  />
                </StyledImageContainer>
              )}

              <StyledPostContentContainer>
                <StyledPostTitle>{post.title}</StyledPostTitle>
                <StyledPostContent>{post.content}</StyledPostContent>

                {post.pdfUrl && (
                  <StyledAttachments>
                    <StyledPdfLink
                      href={post.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <StyledPdfIcon>
                        <FaFilePdf />
                      </StyledPdfIcon>
                      <span>{getFilenameFromUrl(post.pdfUrl)}</span>
                    </StyledPdfLink>
                  </StyledAttachments>
                )}
              </StyledPostContentContainer>

              <StyledPostFooter>
                <StyledFooterActions>
                  <StyledIconButton
                    className={isLiked ? "liked" : ""}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(post.id, newVoteType);
                    }}
                  >
                    {isLiked ? <FaHeart /> : <FaRegHeart />}
                    <span>{post.score}</span>
                  </StyledIconButton>

                  <StyledIconButton>
                    <FaRegCommentAlt />
                    <span>{post._count?.comments || 0}</span>
                  </StyledIconButton>
                </StyledFooterActions>

                {permissions.canModerate && (
                  <StyledDeleteButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(post.id, true);
                    }}
                  >
                    Delete
                  </StyledDeleteButton>
                )}
                {!permissions.canModerate &&
                  isAuthor &&
                  permissions.canPost && (
                    <StyledDeleteButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(post.id, false);
                      }}
                    >
                      Delete
                    </StyledDeleteButton>
                  )}
              </StyledPostFooter>
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
          Previous
        </StyledButton>
        <span>
          Page {page} of {totalPages}
        </span>
        <StyledButton
          onClick={() => setPage(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </StyledButton>
      </div>
    </StyledContainer>
  );
};

export default BlogPostsSection;
