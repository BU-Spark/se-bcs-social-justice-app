"use client";

import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Link from "next/link";
import Sidebar from "../../../components/Sidebar";
import BlogPostsSection from "@/app/components/BlogPostsSection";

type Community = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string | null;
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

  useEffect(() => {
    const fetchCommunity = async () => {
      const res = await fetch(`/api/communities/${params.communityid}`);
      if (res.ok) {
        const data = await res.json();
        setCommunity(data);
      }
    };
    fetchCommunity();
  }, [params.communityid]);

  if (!community) return <p>Loading...</p>;

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
        <BlogPostsSection communityId={community.id} />
      </StyledMainContent>
    </StyledContainer>
  );
};

export default CommunityPage;
