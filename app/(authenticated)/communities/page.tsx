"use client";

import CommunityForm from "@/app/components/CommunityForm";
import { CommunitiesData, Community } from "@/types/community";
import { useUser } from "@clerk/nextjs";
import styled from "@emotion/styled";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSidebar } from "../../components/SidebarContext";

interface CommunityCardProps {
  community: Community;
  highlighted?: boolean;
  onUnjoin: (id: string) => void;
  onView: (id: string) => void;
}

interface RecommendationCardProps {
  community: Community;
  onJoin: (id: string) => void;
}

interface CommunitiesSectionProps {
  title: string;
  communities: Community[];
  loading: boolean;
  emptyMessage: string;
  variant: "grid" | "list";
  onCardAction: (id: string, action: "join" | "unjoin" | "view") => void;
}

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  margin-left: ${(props) => (props.isExpanded ? "280px" : "80px")};
  margin-right: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
  transition: margin-left 0.3s ease-in-out;

  @media (max-width: 768px) {
    padding: 1rem 0.75rem;
  }
`;

const StyledSection = styled.section`
  margin-bottom: 2.5rem;

  @media (max-width: 640px) {
    margin-bottom: 1.5rem;
  }
`;

const StyledCommunitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, clamp(200px, 25%, 280px));
  gap: 1.5rem;
`;

const StyledCommunityCard = styled.div<{ highlighted?: boolean }>`
  display: flex;
  flex-direction: column;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s ease;
  border: ${(props) => (props.highlighted ? "3px solid #ffc107" : "none")};
  cursor: pointer;

  width: clamp(260px, 22vw, 360px);
  max-width: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 640px) {
    width: 90%;
    border-radius: 8px;
  }
`;

const StyledCardImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
`;

const StyledCardContent = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 640px) {
    padding: 1rem;
  }
`;

const StyledCardTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
`;

const StyledCardDescription = styled.p`
  font-size: 0.9rem;
  color: #555;
  margin: 0;
  line-height: 1.5;
  flex: 1;
`;

const StyledMemberAvatars = styled.div`
  display: flex;
  align-items: center;
  margin-top: 0.75rem;

  & > * + * {
    margin-left: -0.5rem;
  }
`;

const StyledMemberCircle = styled.div<{ imageUrl?: string }>`
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1rem;
  color: white;
  background-color: ${({ imageUrl }) => (imageUrl ? "transparent" : "skyblue")};
  background-image: ${({ imageUrl }) =>
    imageUrl ? `url(${imageUrl})` : "none"};
  background-size: cover;
  background-position: center;
`;

const StyledCardButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    padding: 0 1rem 1rem 1rem;
    gap: 0.5rem;
  }
`;

const StyledRecommendationList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  @media (max-width: 640px) {
    gap: 1rem;
  }
`;

const StyledRecommendationCard = styled.div`
  display: flex;
  height: 12rem;
  width: 100%;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    padding: 1rem;
  }

  @media (max-width: 640px) {
    padding: 0.75rem;
  }
`;

const StyledRecommendationImage = styled.img`
  height: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  object-fit: cover;
  border-radius: 8px;
  margin: auto 0.5rem;
`;

const StyledRecommendationContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
`;

const StyledRecommendationTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1a1a1a;
`;

const StyledRecommendationDescription = styled.p`
  font-size: 0.95rem;
  color: #555;
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const StyledRecommendationButtonGroup = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;

  @media (max-width: 640px) {
    gap: 0.5rem;
  }
`;

const StyledHeader = styled.h1<{ level?: "main" | "section" }>`
  font-size: ${(props) => (props.level === "section" ? "1.75rem" : "2.25rem")};
  font-weight: 700;
  margin: ${(props) =>
    props.level === "section" ? "0 0 1.5rem 0" : "0 0 0.5rem 0"};
  color: #1a1a1a;

  @media (max-width: 768px) {
    font-size: ${(props) =>
      props.level === "section" ? "1.4rem" : "1.875rem"};
  }
`;

const StyledDescription = styled.p`
  font-size: 1rem;
  color: #666;

  @media (max-width: 640px) {
    font-size: 0.95rem;
  }
`;

const StyledButton = styled.button<{
  variant?: "primary" | "unjoin" | "secondary";
  small?: boolean;
}>`
  padding: ${(props) => (props.small ? "0.5rem 1rem" : "0.75rem 1.5rem")};
  background-color: ${(props) => {
    switch (props.variant) {
      case "unjoin":
        return "#dc2626";
      case "secondary":
        return "#e5e7eb";
      default:
        return "black";
    }
  }};
  color: ${(props) => (props.variant === "secondary" ? "#1f2937" : "white")};
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: ${(props) => (props.small ? "0.875rem" : "1rem")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => {
      switch (props.variant) {
        case "unjoin":
          return "#b91c1c";
        case "secondary":
          return "#d1d5db";
        default:
          return "#1d4ed8";
      }
    }};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    padding: ${(props) => (props.small ? "0.4rem 0.8rem" : "0.6rem 1.2rem")};
    font-size: ${(props) => (props.small ? "0.75rem" : "0.9rem")};
  }
`;

const StyledLoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f9fafb;
  border-radius: 8px;
  min-height: 200px;

  p {
    color: #6b7280;
    font-size: 1rem;
  }
`;

const StyledEmptyMessage = styled.p`
  padding: 1.5rem;
  background-color: #f9fafb;
  border-radius: 8px;
  color: #6b7280;
  text-align: center;
  font-size: 0.95rem;
`;

function CommunityCard({
  community,
  highlighted,
  onUnjoin,
  onView,
}: CommunityCardProps) {
  return (
    <StyledCommunityCard highlighted={highlighted}>
      <StyledCardImage
        src={
          community.imageUrl ||
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_image.jpg"
        }
        alt={community.name}
      />
      <StyledCardContent>
        <StyledCardTitle>{community.name}</StyledCardTitle>
        <StyledCardDescription>{community.description}</StyledCardDescription>
        <StyledMemberAvatars>
          {community.members.slice(0, 3).map((member) => {
            const initial = member.user.username?.[0].toUpperCase() || "?";
            return (
              <StyledMemberCircle
                key={member.user.username}
                imageUrl={member.user.imageUrl ?? undefined}
              >
                {!member.user.imageUrl && initial}
              </StyledMemberCircle>
            );
          })}
          {community._count.members > 3 && (
            <StyledMemberCircle>
              +{community._count.members - 3}
            </StyledMemberCircle>
          )}
        </StyledMemberAvatars>
      </StyledCardContent>
      <StyledCardButtonGroup>
        <StyledButton
          variant="unjoin"
          small
          onClick={() => onUnjoin(community.id)}
        >
          Unjoin
        </StyledButton>
        <Link href={`/communities/${community.id}`} passHref>
          <StyledButton
            variant="secondary"
            small
            onClick={() => onView(community.id)}
          >
            View
          </StyledButton>
        </Link>
      </StyledCardButtonGroup>
    </StyledCommunityCard>
  );
}

function RecommendationCard({ community, onJoin }: RecommendationCardProps) {
  return (
    <StyledRecommendationCard>
      <StyledRecommendationImage
        src={
          community.imageUrl ||
          "https://upload.wikimedia.org/wikipedia/commons/a/a7/Blank_image.jpg"
        }
        alt={community.name}
      />
      <StyledRecommendationContent>
        <StyledRecommendationTitle>{community.name}</StyledRecommendationTitle>
        <StyledRecommendationDescription>
          {community.description}
        </StyledRecommendationDescription>
        <StyledRecommendationButtonGroup>
          <StyledButton
            variant="primary"
            small
            onClick={() => onJoin(community.id)}
          >
            Join
          </StyledButton>
        </StyledRecommendationButtonGroup>
      </StyledRecommendationContent>
    </StyledRecommendationCard>
  );
}

function CommunitiesSection({
  title,
  communities,
  loading,
  emptyMessage,
  variant,
  onCardAction,
}: CommunitiesSectionProps) {
  return (
    <StyledSection>
      <StyledHeader level="section">{title}</StyledHeader>

      {loading ? (
        <StyledLoadingContainer>
          <p>Loading communities...</p>
        </StyledLoadingContainer>
      ) : communities.length === 0 ? (
        <StyledEmptyMessage>{emptyMessage}</StyledEmptyMessage>
      ) : variant === "grid" ? (
        <>
          <StyledDescription>
            Groups where you connect with others, collaborate on ideas, and be
            willing to grow
          </StyledDescription>
          <br />
          <StyledCommunitiesGrid>
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                community={community}
                highlighted={false}
                onUnjoin={() => onCardAction(community.id, "unjoin")}
                onView={() => onCardAction(community.id, "view")}
              />
            ))}
          </StyledCommunitiesGrid>
        </>
      ) : (
        <>
          <StyledDescription>
            Communities we think you’ll like based on your preferences
          </StyledDescription>
          <StyledRecommendationList>
            {communities.map((community) => (
              <RecommendationCard
                key={community.id}
                community={community}
                onJoin={() => onCardAction(community.id, "join")}
              />
            ))}
          </StyledRecommendationList>
        </>
      )}
    </StyledSection>
  );
}

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
      console.log(jsonData);
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

  const handleCardAction = (id: string, action: "join" | "unjoin" | "view") => {
    switch (action) {
      case "join":
        handleJoinCommunity(id);
        break;
      case "unjoin":
        handleUnjoinCommunity(id);
        break;
      case "view":
        break;
    }
  };
  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader level="main">Welcome back, {user?.fullName}</StyledHeader>
      <StyledDescription>
        Here are your communities and recommendations.
      </StyledDescription>
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
      <CommunitiesSection
        title="My Communities"
        communities={data.joinedCommunities}
        loading={loading}
        emptyMessage="You are not in any communities currently!"
        variant="grid"
        onCardAction={handleCardAction}
      />

      <CommunitiesSection
        title="Recommended Communities"
        communities={data.recommendedCommunities}
        loading={loading}
        emptyMessage="There are no groups available currently!"
        variant="list"
        onCardAction={handleCardAction}
      />
    </StyledMainContent>
  );
};

export default CommunitiesPage;
