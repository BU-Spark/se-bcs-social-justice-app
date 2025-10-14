"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import Image from "next/image";
import { CircularProgress } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GavelIcon from "@mui/icons-material/Gavel";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { useRouter } from "next/navigation";

//const router = useRouter();

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
  background-color: #f5f5f5;
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

interface AppointmentType {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  accessType: string;
  createdAt: string;
  updatedAt: string;
}

const IconMap: { [key: string]: React.ComponentType } = {
  Person: PersonIcon,
  Groups: GroupsIcon,
  Work: WorkIcon,
  Psychology: PsychologyIcon,
  Gavel: GavelIcon,
};

const DynamicIcon = ({ iconName }: { iconName: string }) => {
  const IconComponent = IconMap[iconName];
  if (!IconComponent) {
    return <PersonIcon />; // Fallback icon
  }
  return <IconComponent />;
};

// Placeholder data for other tabs
const placeholderWorkshops = [
  {
    id: "workshop-1",
    typeName: "Group Leadership Workshop",
    description: "Learn leadership skills in a group setting",
    icon: "Groups",
  },
  {
    id: "workshop-2",
    typeName: "Community Building Seminar",
    description: "Build stronger communities together",
    icon: "Groups",
  },
  {
    id: "workshop-3",
    typeName: "Social Justice Training",
    description: "Intensive training on social justice topics",
    icon: "Work",
  },
];

const placeholderDownloads = [
  {
    id: "download-1",
    typeName: "Leadership Guide PDF",
    description: "Comprehensive guide to leadership",
    icon: "Work",
  },
  {
    id: "download-2",
    typeName: "Community Toolkit",
    description: "Tools and resources for community organizers",
    icon: "Groups",
  },
  {
    id: "download-3",
    typeName: "Workshop Materials",
    description: "Downloadable materials from past workshops",
    icon: "Person",
  },
];

const placeholderPurchases = [
  {
    id: "purchase-1",
    typeName: "One-on-One Session - Jan 2024",
    description: "Completed coaching session",
    icon: "Person",
  },
  {
    id: "purchase-2",
    typeName: "Leadership Workshop - Dec 2023",
    description: "Attended group workshop",
    icon: "Groups",
  },
];

export default function CoachingPage() {
  const { isExpanded } = useSidebar();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Coaching");
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        const response = await fetch("/api/appointment-types");
        if (!response.ok) {
          throw new Error("Failed to fetch appointment types");
        }
        const data = await response.json();
        setAppointmentTypes(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load appointment types"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  if (loading) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      </StyledMainContent>
    );
  }

  if (error) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <div className="flex justify-center items-center h-screen text-red-500">
          {error}
        </div>
      </StyledMainContent>
    );
  }

  // Render coaching grid with real data
  const renderCoachingGrid = () => (
    <CoachingGrid>
      {appointmentTypes.map((type) => (
        <CoachingCard 
          key={type.id}
          onClick={() => router.push(`/coaching/${type.id}`)}
          style={{ cursor: 'pointer' }}
        >
          <CardImageContainer>
            {!imageErrors[type.id] ? (
              <Image
                src={`/images/coaching/${type.id}.jpg`}
                alt={type.title}
                fill
                style={{ objectFit: "cover" }}
                onError={() => {
                  setImageErrors((prev) => ({ ...prev, [type.id]: true }));
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <DynamicIcon iconName={type.icon} />
              </div>
            )}
            <ActionButtons>
              <IconButton onClick={(e) => e.stopPropagation()}>
                <FavoriteIcon />
              </IconButton >
              <IconButton onClick={(e) => e.stopPropagation()}>
                <ShareIcon />
              </IconButton>
            </ActionButtons>
          </CardImageContainer>
          <CardContent>
            <CardLabel>Coaching Package</CardLabel>
            <CardTitle>{type.title}</CardTitle>
            <CardDetails>
              <DetailItem>
                <DynamicIcon iconName={type.icon} />
                Weekly meetings
              </DetailItem>
              <DetailItem>
                <AccessTimeIcon />1 hr
              </DetailItem>
            </CardDetails>
          </CardContent>
        </CoachingCard>
      ))}
    </CoachingGrid>
  );

  // Workshops grid with placeholder cards
  const renderWorkshopsGrid = () => (
    <CoachingGrid>
      {placeholderWorkshops.map((workshop) => (
        <CoachingCard key={workshop.id}>
          <CardImageContainer>
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <DynamicIcon iconName={workshop.icon} />
            </div>
            <ActionButtons>
              <IconButton>
                <FavoriteIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </ActionButtons>
          </CardImageContainer>
          <CardContent>
            <CardLabel>Workshop</CardLabel>
            <CardTitle>{workshop.typeName}</CardTitle>
            <CardDetails>
              <DetailItem>
                <DynamicIcon iconName={workshop.icon} />
                Group Session
              </DetailItem>
              <DetailItem>
                <AccessTimeIcon />2 hrs
              </DetailItem>
            </CardDetails>
          </CardContent>
        </CoachingCard>
      ))}
    </CoachingGrid>
  );

  // Download grid with placeholder cards
  const renderDownloadGrid = () => (
    <CoachingGrid>
      {placeholderDownloads.map((download) => (
        <CoachingCard key={download.id}>
          <CardImageContainer>
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <DynamicIcon iconName={download.icon} />
            </div>
            <ActionButtons>
              <IconButton>
                <FavoriteIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </ActionButtons>
          </CardImageContainer>
          <CardContent>
            <CardLabel>Digital Resource</CardLabel>
            <CardTitle>{download.typeName}</CardTitle>
            <CardDetails>
              <DetailItem>
                <DynamicIcon iconName={download.icon} />
                PDF Download
              </DetailItem>
              <DetailItem>
                <AccessTimeIcon />Instant Access
              </DetailItem>
            </CardDetails>
          </CardContent>
        </CoachingCard>
      ))}
    </CoachingGrid>
  );

  // My Purchases grid with placeholder cards
  const renderMyPurchasesGrid = () => (
    <CoachingGrid>
      {placeholderPurchases.map((purchase) => (
        <CoachingCard key={purchase.id}>
          <CardImageContainer>
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <DynamicIcon iconName={purchase.icon} />
            </div>
            <ActionButtons>
              <IconButton>
                <FavoriteIcon />
              </IconButton>
              <IconButton>
                <ShareIcon />
              </IconButton>
            </ActionButtons>
          </CardImageContainer>
          <CardContent>
            <CardLabel>Past Purchase</CardLabel>
            <CardTitle>{purchase.typeName}</CardTitle>
            <CardDetails>
              <DetailItem>
                <DynamicIcon iconName={purchase.icon} />
                Completed
              </DetailItem>
              <DetailItem>
                <AccessTimeIcon />View Receipt
              </DetailItem>
            </CardDetails>
          </CardContent>
        </CoachingCard>
      ))}
    </CoachingGrid>
  );

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

      {activeTab === "Coaching" && renderCoachingGrid()}
      {activeTab === "Workshops" && renderWorkshopsGrid()}
      {activeTab === "Download" && renderDownloadGrid()}
      {activeTab === "My Purchases" && renderMyPurchasesGrid()}
    </StyledMainContent>
  );
}
