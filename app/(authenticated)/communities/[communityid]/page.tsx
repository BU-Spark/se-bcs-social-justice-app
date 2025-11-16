"use client";

import BlogPostsSection from "@/app/components/BlogPostsSection";
import styled from "@emotion/styled";
import Link from "next/link";
import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";

type Community = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
};

type CommunityPermissions = {
  canView: boolean;
  canPost: boolean;
  canComment: boolean;
  canModerate: boolean;
};

const StyledContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const StyledSidebarContainer = styled.div`
  width: 220px;
  background-color: white;
  border-right: 1px solid black;
  padding: 16px;
`;

const StyledMainContent = styled.div`
  flex: 1;
  padding: 16px;
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

const CommunityPage = ({ params }: { params: { communityid: string } }) => {
  const [community, setCommunity] = useState<Community | null>(null);
  const [permissions, setPermissions] = useState<CommunityPermissions | null>(
    null,
  );
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

  if (!community || !permissions) {
    return <p>Loading</p>;
  }
  return (
    <StyledContainer>
      <StyledSidebarContainer>
        <Sidebar />
      </StyledSidebarContainer>
      <StyledMainContent>
        <StyledHeader>Welcome to the Community: {community.name}</StyledHeader>
        <StyledImage
          src={community.imageUrl || "/default-image.jpg"}
          alt={community.name}
        />
        <StyledText>{community.description}</StyledText>
        <Link href="/dashboard">
          <StyledButton>Back</StyledButton>
        </Link>
        <BlogPostsSection
          communityId={community.id}
          permissions={permissions}
        />
      </StyledMainContent>
    </StyledContainer>
  );
};

export default CommunityPage;
