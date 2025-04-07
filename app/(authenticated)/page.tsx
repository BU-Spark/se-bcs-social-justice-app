"use client";

import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../components/SidebarContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { CommunitiesData, Community } from "@/types/community";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const StyledSection = styled.section`
  margin-bottom: 28px;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: white;
  gap: 12px;
`;

const StyledImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
`;

const StyledHeader = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const StyledText = styled.div`
  flex: 1;
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

export default function DashboardPage() {
  const { user } = useUser();
  const { isExpanded } = useSidebar();
  const [data, setData] = useState<CommunitiesData>({
    joinedCommunities: [],
    recommendedCommunities: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/communities");
      if (!res.ok) throw new Error("Failed to fetch communities");
      const json: CommunitiesData = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error fetching communities:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader>Welcome, {user?.fullName}</StyledHeader>
      <p>Here are your communities and recommendations.</p>
      <br />
      <StyledSection>
        <StyledHeader>My Communities</StyledHeader>
        {loading ? (
          <p>Loading...</p>
        ) : data.joinedCommunities.length === 0 ? (
          <p>You are not in any communities currently!</p>
        ) : (
          data.joinedCommunities.map((community: Community) => (
            <StyledDiv key={community.id}>
              <StyledImage
                src={community.imageUrl || "/default-image.jpg"}
                alt={community.name}
              />
              <StyledText>
                <strong>{community.name}</strong>
                <p>{community.description}</p>
              </StyledText>
              <Link href={`/communities/${community.id}`}>
                <StyledButton>View</StyledButton>
              </Link>
            </StyledDiv>
          ))
        )}
      </StyledSection>
      <StyledSection>
        <StyledHeader>Recommended Communities</StyledHeader>
        {loading ? (
          <p>Loading...</p>
        ) : data.recommendedCommunities.length === 0 ? (
          <p>There are no groups available currently!</p>
        ) : (
          data.recommendedCommunities.map((group: Community) => (
            <StyledDiv key={group.id}>
              <StyledImage
                src={group.imageUrl || "/default-image.jpg"}
                alt={group.name}
              />
              <StyledText>
                <strong>{group.name}</strong>
                <p>{group.description}</p>
              </StyledText>
              <Link href={`/communities/${group.id}`}>
                <StyledButton>View</StyledButton>
              </Link>
            </StyledDiv>
          ))
        )}
      </StyledSection>
    </StyledMainContent>
  );
}
