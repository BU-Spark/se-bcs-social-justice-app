"use client";

import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { CommunitiesData, Community } from "@/types/community";
import { useSidebar } from "../../components/SidebarContext";

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

  useEffect(() => {
    const fetchCommunities = async () => {
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
    };
    fetchCommunities();
  }, []);

  const handleJoinCommunity = (communityId: string) => {
    const communityToJoin = data.recommendedCommunities.find(
      (community) => community.id === communityId,
    );
    if (!communityToJoin) return;
    setData((prev) => ({
      joinedCommunities: [...prev.joinedCommunities, communityToJoin],
      recommendedCommunities: prev.recommendedCommunities.filter(
        (community) => community.id !== communityId,
      ),
    }));
  };

  const handleUnjoinCommunity = (communityId: string) => {
    const communityToUnjoin = data.joinedCommunities.find(
      (community) => community.id === communityId,
    );
    if (!communityToUnjoin) return;
    setData((prev) => ({
      joinedCommunities: prev.joinedCommunities.filter(
        (community) => community.id !== communityId,
      ),
      recommendedCommunities: [
        ...prev.recommendedCommunities,
        communityToUnjoin,
      ],
    }));
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      {loading ? (
        <div className="flex items-center justify-center h-full">
          <p>Loading your communities...</p>
        </div>
      ) : (
        <>
          <StyledHeader>Welcome back, {user?.fullName}</StyledHeader>
          <p>Here are your communities and recommendations.</p>
          <br />
          <StyledSection>
            <StyledHeader>My Communities</StyledHeader>
            {data.joinedCommunities.length === 0 ? (
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
                  <StyledButton
                    onClick={() => handleUnjoinCommunity(community.id)}
                  >
                    Unjoin
                  </StyledButton>
                </StyledDiv>
              ))
            )}
          </StyledSection>
          <StyledSection>
            <StyledHeader>Recommended Communities</StyledHeader>
            {data.recommendedCommunities.length === 0 ? (
              <p>There are no groups available currently!</p>
            ) : (
              data.recommendedCommunities.map((community: Community) => (
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
                  <StyledButton
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    Join
                  </StyledButton>
                </StyledDiv>
              ))
            )}
          </StyledSection>
        </>
      )}
    </StyledMainContent>
  );
};

export default CommunitiesPage;
