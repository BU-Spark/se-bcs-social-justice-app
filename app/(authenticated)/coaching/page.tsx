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
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@mui/material";
import SeminarDetail, { Seminar } from "./seminars/seminarPage";

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

  img {
    pointer-events: none;
  }
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

// interface AppointmentType {
//   id: string;
//   title: string;
//   description: string | null;
//   icon: string;
//   accessType: string;
//   createdAt: string;
//   updatedAt: string;
// }

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
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("Course");
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [seminars, setSeminars] = useState<Seminar[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSeminars, setLoadingSeminars] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // keep activeTab synced
  useEffect(() => {
    const tabParam = searchParams.get("tab") || "Course";
    setActiveTab(tabParam);
  }, [searchParams]);

  //check admin status
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        let data = null;
  
        // Try to parse JSON safely, even if response is 403/401
        try {
          data = await res.json();
        } catch {
          data = null;
        }
        if (res.ok && data?.isAdmin) {
          // ✅ success: route returned { isAdmin: true }
          setIsAdmin(true);
        } else {
          // ❌ any error / non-admin / 403 case
          setIsAdmin(false);
        }
        console.log("Admin API response:", res.status, data);
      } catch (error) {
        console.error("Error checking admin:", error);
        setIsAdmin(false);
      }
    };

    checkAdmin();
  }, []);
  // useEffect(() => {
  //   const checkAdmin = async () => {
  //     try {
  //       const res = await fetch("/api/check-admin");
  //       setIsAdmin(res.ok);
  //     } catch {
  //       setIsAdmin(false);
  //     }
  //   };
  //   checkAdmin();
  // }, []);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      setSelectedSeminar(null);
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

  // Fetch seminars
  useEffect(() => {
    async function fetchSeminars() {
      try {
        setLoadingSeminars(true);
        const res = await fetch("/api/seminar");
        if (res.ok) {
          const data = await res.json();
          setSeminars(Array.isArray(data) ? data : []);
        } else {
          console.error("Failed to fetch seminars");
        }
      } catch (err) {
        console.error("Error fetching seminars:", err);
      } finally {
        setLoadingSeminars(false);
      }
    }
    fetchSeminars();
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

  // Seminars grid
  const renderSeminarsGrid = () => {
    if (selectedSeminar) {
      return (
        <SeminarDetail
          seminar={selectedSeminar}
          onBack={() => {
            setSelectedSeminar(null);
            if (window.history.state && window.history.state.seminarId) {
              window.history.back();
            }
          }}
        />
      );
    }

    if (loading) {
      return (
        <p style={{ textAlign: "center", color: "#64748b" }}>
          Loading seminars...
        </p>
      );
    }

    return (
      <>
        {activeTab === "Seminars" && isAdmin && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              padding: "0 24px 20px",
            }}
          >
            <Button
              variant="contained"
              onClick={() => router.push("/coaching/seminars/create")}
              sx={{
                backgroundColor: "#1F3A8A",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1,
                "&:hover": { backgroundColor: "#4f46e5" },
              }}
            >
              + Create Seminar
            </Button>
          </div>
        )}

        {/* if there are no seminars */}
        {seminars.length === 0 ? (
          <p style={{ textAlign: "center", color: "#64748b" }}>
            No seminars available
          </p>
        ) : (
          <CoachingGrid>
            {seminars.map((seminar) => (
              <CoachingCard
                key={seminar.id}
                onClick={() => setSelectedSeminar(seminar)}
                style={{ cursor: "pointer" }}
              >
                <CardImageContainer>
                  {!imageErrors[seminar.id] && seminar.image ? (
                    <Image
                      src={seminar.image}
                      alt={seminar.title}
                      fill
                      style={{ objectFit: "cover" }}
                      onError={() =>
                        setImageErrors((prev) => ({
                          ...prev,
                          [seminar.id]: true,
                        }))
                      }
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center bg-gray-100"
                      style={{ fontSize: 40, color: "#6366f1" }}
                    >
                      <GroupsIcon />
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
                  <CardTitle>{seminar.title}</CardTitle>
                  <CardDetails>
                    <DetailItem>
                      <AccessTimeIcon />
                      {seminar.duration ?? 60} mins
                    </DetailItem>
                    <DetailItem>
                      <GroupsIcon />
                      {seminar.hostName}
                    </DetailItem>
                  </CardDetails>
                </CardContent>
              </CoachingCard>
            ))}
          </CoachingGrid>
        )}
      </>
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
              setSelectedSeminar(null);
            }}
          >
            Course
          </Tab>
          <Tab
            active={activeTab === "Seminars"}
            onClick={() => {
              setActiveTab("Seminars");
              setSelectedSeminar(null);
              router.push("?tab=Seminars");
            }}
          >
            Seminars
          </Tab>
          <Tab
            active={activeTab === "Download"}
            onClick={() => {
              setActiveTab("Download");
              setSelectedSeminar(null);
            }}
          >
            Download
          </Tab>
          <Tab
            active={activeTab === "My Purchases"}
            onClick={() => {
              setActiveTab("My Purchases");
              setSelectedSeminar(null);
            }}
          >
            My Purchases
          </Tab>
        </TabContainer>
      </PageHeader>

      {activeTab === "Course" && renderCoachingGrid()}
      {activeTab === "Seminars" && renderSeminarsGrid()}
      {activeTab === "Download" && renderDownloadGrid()}
      {activeTab === "My Purchases" && renderMyPurchasesGrid()}
    </StyledMainContent>
  );
}
