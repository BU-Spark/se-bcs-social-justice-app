"use client";

import styled from "@emotion/styled";
import { useEffect, useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { CommunitiesData, Community } from "@/types/community";
import { useSidebar } from "../../components/SidebarContext";
import Link from "next/link";
import CommunityForm from "@/app/components/CommunityForm";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
`;

const StyledSection = styled.section`
  margin-bottom: 28px;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: white;
  gap: 12px;
`;

const StyledImage = styled.img`
  flex-shrink: 0;
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

const CommunitiesPage = () => {
  const { user } = useUser();
  const { isExpanded } = useSidebar();
  const [data, setData] = useState<CommunitiesData>({
    joinedCommunities: [],
    recommendedCommunities: [],
  });
  const [loading, setLoading] = useState(true);
  const [canCreateCommunity, setCanCreateCommunity] = useState<boolean>(false);
  const [isFormVisible, setIsFormVisible] = useState(false);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/communities");
      if (!response.ok) throw new Error("Failed to fetch communities");
      const jsonData: CommunitiesData = await response.json();
      setData(jsonData);
    } catch (error) {
      console.error("Error fetching communities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const res = await fetch("/api/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });
      if (!res.ok) throw new Error("Failed to join community");
      fetchCommunities();
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  const handleUnjoinCommunity = async (communityId: string) => {
    try {
      const res = await fetch("/api/unjoin-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });
      if (!res.ok) throw new Error("Failed to unjoin community");
      fetchCommunities();
    } catch (error) {
      console.error("Error unjoining community:", error);
    }
  };

  useEffect(() => {
    const checkCreatePermission = async () => {
      try {
        const res = await fetch("/api/not-regmember");
        if (res.ok) {
          const data = await res.json();
          setCanCreateCommunity(data.canCreateCommunity);
        } else {
          setCanCreateCommunity(false);
        }
      } catch (error) {
        console.error("Error checking community creation permission:", error);
        setCanCreateCommunity(false);
      }
    };
    checkCreatePermission();
  }, []);

  const handleCommunityCreated = () => {
    fetchCommunities();
    setIsFormVisible(false);
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader>Welcome back, {user?.fullName}</StyledHeader>
      <p>Here are your communities and recommendations.</p>
      <br />

      {canCreateCommunity && (
        <>
          <StyledButton onClick={() => setIsFormVisible(!isFormVisible)}>
            {isFormVisible ? "Cancel" : "Create Community"}
          </StyledButton>
          {isFormVisible && (
            <CommunityForm
              onCommunityCreated={handleCommunityCreated}
              onCancel={() => setIsFormVisible(false)}
            />
          )}
        </>
      )}
      <br />
      <br />
      <StyledSection>
        <StyledHeader>My Communities</StyledHeader>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p>Loading your communities...</p>
          </div>
        ) : data.joinedCommunities.length === 0 ? (
          <p>You are not in any communities currently!</p>
        ) : (
          data.joinedCommunities.map((community: Community) => (
            <StyledDiv key={community.id}>
              <StyledImage
                src={
                  community.imageUrl ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_image.jpg"
                }
                alt={community.name}
              />
              <StyledText>
                <strong>{community.name}</strong>
                <p>{community.description}</p>
              </StyledText>
              <StyledButton onClick={() => handleUnjoinCommunity(community.id)}>
                Unjoin
              </StyledButton>
              <Link href={`/communities/${community.id}`} passHref>
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
                src={
                  group.imageUrl ||
                  "https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_image.jpg"
                }
                alt={group.name}
              />
              <StyledText>
                <strong>{group.name}</strong>
                <p>{group.description}</p>
              </StyledText>
              <StyledButton onClick={() => handleJoinCommunity(group.id)}>
                Join
              </StyledButton>
            </StyledDiv>
          ))
        )}
      </StyledSection>
    </StyledMainContent>
  );
};

export default CommunitiesPage;
