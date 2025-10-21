"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import Image from "next/image";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GavelIcon from "@mui/icons-material/Gavel";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LockIcon from "@mui/icons-material/Lock";
import { useRouter } from "next/navigation";
import Seminars, { Workshop } from "./seminaros/page";

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

interface Workshop {
  id: string;
  typeName: string;
  description: string;
  icon: string;
  longDescription?: string;
}

interface Module {
  id: string;
  title: string;
  moduleNumber: number | null;
  description: string | null;
  courseId: string;
  createdAt: string;
}

interface Course {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isStandalone: boolean;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  hasAccess?: boolean;
  accessType?: "locked" | "purchased" | "subscription";
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

// Placeholder data for seminartab
const placeholderWorkshops: Workshop[] = [
  {
    id: 1,
    image: "/mic.jpeg",
    typeName: "Courageous Leadership Development",
    icon: "Groups",
    accessType: "public",
    date: "2025-11-03T14:00:00Z",
    duration: 120,
    longDescription:
      "Participants learn how to lead with fairness, build trust, and strengthen resilience within teams and organizations.",
  },
  {
    id:2,
    image: "/mic.jpeg",
    typeName: "Why We Need Courageous Hearts",
    icon: "Groups",
    accessType: "public",
    date: "2025-10-23T14:00:00Z",
    duration: 180,
    longDescription:
      "Dr. Starks shares why courageous hearts are the foundation of justice work. Before we can change systems, we must heal ourselves. Justice begins inside.",
  },
  {
    id: 3,
    image: "/mic.jpeg",
    typeName: "Social Justice Training",
    icon: "Groups",
    accessType: "public",
    date: "2025-11-23T14:00:00Z",
    duration: 60,
    longDescription:
      "This program builds a hub for justice-focused research and advocacy inside universities. Includes faculty workshops, mentoring, grant support, and community partnerships.",
  },
];

// Mapping for course images based on index
const courseImages = ["/Media.png", "/Media(1).png", "/Media(2).png"];
const courseIcons = ["Person", "Groups", "Work", "Psychology", "Gavel"];

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
  const [activeTab, setActiveTab] = useState("Course");
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null,
  );
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setSelectedWorkshop(null);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Fetch courses from API
  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error("Failed to fetch courses");
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  // Render coaching grid with courses from database
  const renderCoachingGrid = () => {
    if (loading) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          Loading courses...
        </div>
      );
    }

    if (courses.length === 0) {
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "300px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          No courses available
        </div>
      );
    }

    return (
      <CoachingGrid>
        {courses.map((course, index) => {
          const icon = courseIcons[index % courseIcons.length];
          const image = courseImages[index % courseImages.length];
          const isLocked = !course.hasAccess;

          return (
            <CoachingCard
              key={course.id}
              onClick={() => router.push(`/coaching/${course.id}`)}
              style={{ cursor: "pointer", opacity: isLocked ? 0.8 : 1 }}
            >
              <CardImageContainer>
                {!imageErrors[course.id] ? (
                  <Image
                    src={image}
                    alt={course.name}
                    fill
                    style={{
                      objectFit: "cover",
                      filter: isLocked ? "grayscale(50%)" : "none",
                    }}
                    onError={() => {
                      setImageErrors((prev) => ({
                        ...prev,
                        [course.id]: true,
                      }));
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <DynamicIcon iconName={icon} />
                  </div>
                )}
                {isLocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "48px",
                    }}
                  >
                    <LockIcon fontSize="inherit" />
                  </div>
                )}
                <ActionButtons>
                  <IconButton onClick={(e) => e.stopPropagation()}>
                    <FavoriteIcon />
                  </IconButton>
                  <IconButton onClick={(e) => e.stopPropagation()}>
                    <ShareIcon />
                  </IconButton>
                </ActionButtons>
              </CardImageContainer>
              <CardContent>
                <CardLabel>
                  {isLocked ? "🔒 Locked Course" : "Course Package"}
                </CardLabel>
                <CardTitle>{course.name}</CardTitle>
                <CardDetails>
                  <DetailItem>
                    <DynamicIcon iconName={icon} />
                    {course.modules.length} modules
                  </DetailItem>
                  <DetailItem>
                    <AccessTimeIcon />${course.price}
                  </DetailItem>
                </CardDetails>
              </CardContent>
            </CoachingCard>
          );
        })}
      </CoachingGrid>
    );
  };

  // Workshops grid with placeholder cards
  const renderWorkshopsGrid = () => {
    // Show detail if a workshop is selected
    if (selectedWorkshop) {
      return (
        <Seminars
          workshop={selectedWorkshop}
          onBack={() => setSelectedWorkshop(null)}
        />
      );
    }

    // Show grid of workshops
    return (
      <CoachingGrid>
        {placeholderWorkshops.map((workshop) => (
          <CoachingCard
            key={workshop.id}
            onClick={() => {
              setSelectedWorkshop(workshop);
              window.history.pushState(
                { workshopId: workshop.id },
                "",
                `?workshop=${workshop.id}`,
              );
            }}
            style={{ cursor: "pointer" }}
          >
            <CardImageContainer>
              {!imageErrors[workshop.id] ? (
                <Image
                  src={workshop.image}
                  alt={workshop.typeName}
                  fill
                  style={{ objectFit: "cover" }}
                  onError={() => {
                    setImageErrors((prev) => ({
                      ...prev,
                      [workshop.id]: true,
                    }));
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100">
                  <DynamicIcon iconName={workshop.icon} />
                </div>
              )}
              <ActionButtons>
                <IconButton onClick={(e) => e.stopPropagation()}>
                  <FavoriteIcon />
                </IconButton>
                <IconButton onClick={(e) => e.stopPropagation()}>
                  <ShareIcon />
                </IconButton>
              </ActionButtons>
            </CardImageContainer>
            <CardContent>
              <CardLabel>Seminar</CardLabel>
              <CardTitle>{workshop.typeName}</CardTitle>
              <CardDetails>
                <DetailItem>
                  <DynamicIcon iconName={workshop.icon} />
                  Group Session
                </DetailItem>
                <DetailItem>
                  <AccessTimeIcon />{workshop.duration}
                </DetailItem>
              </CardDetails>
            </CardContent>
          </CoachingCard>
        ))}
      </CoachingGrid>
    );
  };

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
                <AccessTimeIcon />
                Instant Access
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
                <AccessTimeIcon />
                View Receipt
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
            active={activeTab === "Course"}
            onClick={() => {
              setActiveTab("Course");
              setSelectedWorkshop(null);
            }}
          >
            Course
          </Tab>
          <Tab
            active={activeTab === "Seminars"}
            onClick={() => {
              setActiveTab("Seminars");
              setSelectedWorkshop(null);
            }}
          >
            Seminars
          </Tab>
          <Tab
            active={activeTab === "Download"}
            onClick={() => {
              setActiveTab("Download");
              setSelectedWorkshop(null);
            }}
          >
            Download
          </Tab>
          <Tab
            active={activeTab === "My Purchases"}
            onClick={() => {
              setActiveTab("My Purchases");
              setSelectedWorkshop(null);
            }}
          >
            My Purchases
          </Tab>
        </TabContainer>
      </PageHeader>

      {activeTab === "Course" && renderCoachingGrid()}
      {activeTab === "Seminars" && renderWorkshopsGrid()}
      {activeTab === "Download" && renderDownloadGrid()}
      {activeTab === "My Purchases" && renderMyPurchasesGrid()}
    </StyledMainContent>
  );
}
