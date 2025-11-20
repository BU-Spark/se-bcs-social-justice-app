"use client";

import BlogPostsSection from "@/app/components/BlogPostsSection";
import CommentsSection from "@/app/components/CommentsSection";
import PostForm from "@/app/components/PostForm";
import { useSidebar } from "@/app/components/SidebarContext";
import { Community, CommunityPermissions } from "@/types/community";
import { Post } from "@/types/posts";
import styled from "@emotion/styled";
import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";

const StyledContainer = styled.div<{ isExpanded: boolean }>`
  display: flex;
  min-height: 100vh;
  margin-left: ${(props) => (props.isExpanded ? "280px" : "80px")};
  transition: margin-left 0.3s ease-in-out;
`;


const StyledMainContent = styled.div`
  flex: 1;
  padding: 16px;
  background-color: #f8f9fa;
`;

const StyledHeader = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const StyledImage = styled.img`
  width: 280px;
  height: auto;
  border-radius: 12px;
  object-fit: cover;
  margin-bottom: 12px;
`;

const StyledText = styled.div`
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 12px;
`;

const StyledButton = styled.button`
  padding: 12px 22px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: red;
  }
`;

const StyledTwoColumnLayout = styled.div`
  display: flex;
  gap: 24px;
  margin-top: 24px;
`;

const StyledLeftColumn = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledRightColumn = styled.div`
  flex: 1;
  min-width: 0;
  position: sticky;
  top: 16px;
  height: calc(100vh - 32px);
  overflow-y: auto;
`;


const StyledInfoPanel = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  text-align: left;
`;

const InfoPanelTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const InfoPanelText = styled.p`
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  margin-bottom: 20px;
`;

const WritePostButton = styled.button`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  font-weight: 600;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #1d4ed8;
  }
`;

const CommunityInfoPanel: React.FC<{
  community: Community;
  permissions: CommunityPermissions; 
  onWritePostClick: () => void;
}> = ({ community, permissions, onWritePostClick }) => (
  <StyledInfoPanel>
    <InfoPanelTitle>{community.name}</InfoPanelTitle>
    <InfoPanelText>{community.description}</InfoPanelText>
    {permissions.canPost && (
      <WritePostButton onClick={onWritePostClick}>Write a Post</WritePostButton>
    )}
  </StyledInfoPanel>
);


const StyledPostDetailPanel = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
`;

const PostDetailHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const PostDetailTitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 12px 0;
`;

const PostDetailContent = styled.p`
  font-size: 16px;
  color: #333;
  line-height: 1.6;
`;

const PostDetailImage = styled.img`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 16px;
`;

const BackButton = styled.button`
  font-size: 14px;
  font-weight: 600;
  color: #555;
  background: transparent;
  border: none;
  cursor: pointer;
  margin-bottom: 16px;
  
  &:hover {
    color: #000;
  }
`;

const PostDetailPanel: React.FC<{
  post: Post;
  permissions: CommunityPermissions;
  onBack: () => void;
  onCommentPosted: () => void;
}> = ({ post, permissions, onBack, onCommentPosted }) => (
  <StyledPostDetailPanel>
    <BackButton onClick={onBack}>← Back to feed</BackButton>
    <PostDetailHeader>
      <img
        src={post.user?.imageUrl || "default-avatar.png"}
        alt="avatar"
        style={{ width: 40, height: 40, borderRadius: "50%", marginRight: 12 }}
      />
      <strong>{post.user?.name || "Unknown"}</strong>
    </PostDetailHeader>
    <PostDetailTitle>{post.title}</PostDetailTitle>
    <PostDetailContent>{post.content}</PostDetailContent>

    {post.imageUrl && (
      <PostDetailImage src={post.imageUrl} alt="Post content" />
    )}

    <CommentsSection
      postId={post.id}
      permissions={permissions}
      onCommentPosted={onCommentPosted}
    />
  </StyledPostDetailPanel>
);

const CommunityPage = ({ params }: { params: { communityid: string } }) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [permissions, setPermissions] = useState<CommunityPermissions | null>(null);
  
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [postListKey, setPostListKey] = useState(Date.now());
  const { isExpanded } = useSidebar();
  

  useEffect(() => {
    const fetchData = async () => {
      const [communityRes, permissionsRes] = await Promise.all([
        fetch(`/api/communities/${params.communityid}`),
        fetch(`/api/communities/${params.communityid}/permissions`),
      ]);

      if (communityRes.ok) {
        const data = await communityRes.json();
        setCommunity(data);
      }

      if (permissionsRes.ok) {
        const data = await permissionsRes.json();
        setPermissions(data);
      }
    };
    fetchData();
  }, [params.communityid]);

  const handleSelectPost = (post: Post) => {
    setSelectedPost(post);
    setIsFormVisible(false);
  };

  const handleShowForm = () => {
    setSelectedPost(null);
    setIsFormVisible(true);
  };

  const handleCloseRightPanel = () => {
    setSelectedPost(null);
    setIsFormVisible(false);
  };

  const handlePostCreated = () => {
    setIsFormVisible(false);
    setSelectedPost(null);
    setPostListKey(Date.now());
  };

  const handleCommentAdded = () => {
    setPostListKey(Date.now());
  };

  if (!community || !permissions) {
    return <p>Loading</p>;
  }

  return (
    <StyledContainer isExpanded={isExpanded}>
      <Sidebar />
      <StyledMainContent>
        <Link href="/communities">
          <StyledButton>Back To Communities</StyledButton>
        </Link>
        <StyledHeader>Welcome to the Community: {community.name}</StyledHeader>
        <StyledImage
          src={community.imageUrl || "/default-image.jpg"}
          alt={community.name}
        />
        <StyledText>{community.description}</StyledText>
        <StyledTwoColumnLayout>
          <StyledLeftColumn>
            <BlogPostsSection
              key={postListKey}
              communityId={community.id}
              permissions={permissions}
              onPostSelect={handleSelectPost}
            />
          </StyledLeftColumn>
          <StyledRightColumn>
            {isFormVisible ? (
              <PostForm
                communityId={community.id}
                onPostCreated={handlePostCreated}
                onCancel={handleCloseRightPanel}
              />
            ) : selectedPost ? (
              <PostDetailPanel
                post={selectedPost}
                permissions={permissions}
                onBack={handleCloseRightPanel}
                onCommentPosted={handleCommentAdded}
              />
            ) : (
              <CommunityInfoPanel
                community={community}
                permissions={permissions}
                onWritePostClick={handleShowForm}
              />
            )}
          </StyledRightColumn>
        </StyledTwoColumnLayout>
      </StyledMainContent>
    </StyledContainer>
  );
};

export default CommunityPage;
