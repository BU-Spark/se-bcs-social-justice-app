"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import styled from "@emotion/styled";
import { useState } from "react";
import Image from "next/image";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
`;

const TabContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 48px;
  border-bottom: 1px solid #e2e8f0;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 12px 24px;
  font-size: 16px;
  color: ${(props) => (props.active ? "#6366f1" : "#64748b")};
  border: none;
  background: none;
  cursor: pointer;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: ${(props) => (props.active ? "#6366f1" : "transparent")};
    transition: background-color 0.2s ease;
  }
`;

const CoachingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 24px;
`;

const CoachingCard = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-4px);
  }
`;

const CardImageContainer = styled.div`
  position: relative;
  width: 100%;
  height: 200px;
`;

const CardContent = styled.div`
  padding: 20px;
`;

const CardLabel = styled.div`
  font-size: 14px;
  color: #6366f1;
  margin-bottom: 8px;
`;

const CardTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const CardDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  color: #64748b;
  font-size: 14px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ActionButtons = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: white;
  }
`;

const coachingPackages = [
  {
    id: 1,
    label: "Coaching Package",
    title: "Empowering Black Communities",
    frequency: "Weekly meetings",
    duration: "1 hr",
    image: "/Media.png",
  },
  {
    id: 2,
    label: "Coaching Package",
    title: "Navigating the Criminal Justice System",
    frequency: "Bi-weekly meetings",
    duration: "1 hr 30 m",
    image: "/Media(1).png",
  },
  {
    id: 3,
    label: "Coaching Package",
    title: "Breakthrough to Greatness",
    frequency: "Weekly meetings",
    duration: "1 hr 30 m",
    image: "/Media(2).png",
  },
];

export default function CoachingPage() {
  const { isExpanded } = useSidebar();
  const [activeTab, setActiveTab] = useState("Coaching");

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <PageHeader>
        <Title>Coaching Services</Title>
        <TabContainer>
          <Tab
            active={activeTab === "Coaching"}
            onClick={() => setActiveTab("Coaching")}
          >
            Coaching
          </Tab>
          <Tab
            active={activeTab === "Workshops"}
            onClick={() => setActiveTab("Workshops")}
          >
            Workshops
          </Tab>
          <Tab
            active={activeTab === "Download"}
            onClick={() => setActiveTab("Download")}
          >
            Download
          </Tab>
          <Tab
            active={activeTab === "My Purchases"}
            onClick={() => setActiveTab("My Purchases")}
          >
            My Purchases
          </Tab>
        </TabContainer>
      </PageHeader>

      <CoachingGrid>
        {coachingPackages.map((pkg) => (
          <CoachingCard key={pkg.id}>
            <CardImageContainer>
              <Image
                src={pkg.image}
                alt={pkg.title}
                fill
                style={{ objectFit: "cover" }}
              />
              <ActionButtons>
                <IconButton>
                  <HeartIcon />
                </IconButton>
                <IconButton>
                  <ShareIcon />
                </IconButton>
              </ActionButtons>
            </CardImageContainer>
            <CardContent>
              <CardLabel>{pkg.label}</CardLabel>
              <CardTitle>{pkg.title}</CardTitle>
              <CardDetails>
                <DetailItem>
                  <LayersIcon />
                  {pkg.frequency}
                </DetailItem>
                <DetailItem>
                  <ClockIcon />
                  {pkg.duration}
                </DetailItem>
              </CardDetails>
            </CardContent>
          </CoachingCard>
        ))}
      </CoachingGrid>
    </StyledMainContent>
  );
}

const HeartIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const ShareIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <polyline points="16 6 12 2 8 6" />
    <line x1="12" y1="2" x2="12" y2="15" />
  </svg>
);

const LayersIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

const ClockIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
