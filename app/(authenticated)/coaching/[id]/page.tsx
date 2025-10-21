"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import GroupsIcon from "@mui/icons-material/Groups";
import WorkIcon from "@mui/icons-material/Work";
import PsychologyIcon from "@mui/icons-material/Psychology";
import GavelIcon from "@mui/icons-material/Gavel";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Image from "next/image";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const BackButton = styled(Button)`
  margin-bottom: 24px;
  text-transform: none;
`;

const ImagePlaceholder = styled.div`
  max-width: 1200px;
  margin: 0 auto 32px auto;
  height: 600px;
  background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const PlaceholderText = styled.div`
  color: #64748b;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 48px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e2e8f0;
`;

const IconContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #1e3a8a; /* Changed to match sidebar bg-blue-900 */
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 40px;

  svg {
    font-size: 40px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
`;

const AccessBadge = styled.span<{ isPrivate: boolean }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
  background: ${(props) => (props.isPrivate ? "#fef3c7" : "#d1fae5")};
  color: ${(props) => (props.isPrivate ? "#92400e" : "#065f46")};
`;

const Description = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 32px;
`;

const ContentRow = styled.div`
  display: flex;
  gap: 32px;
  align-items: flex-start;
  margin-bottom: 32px;
`;

const DescriptionColumn = styled.div`
  flex: 0 0 75%;
`;

const ButtonColumn = styled.div`
  flex: 0 0 calc(25% - 32px);
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const InfoCard = styled.div`
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
`;

const InfoLabel = styled.div`
  font-size: 14px;
  color: #64748b;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
`;

const ActionButtons = styled.div`
  display: flex;
  flex-direction: column; /* Changed from row to column */
  gap: 16px;
  margin-top: 0; /* Changed from 32px to 0 */
`;

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
    return <PersonIcon />;
  }
  return <IconComponent />;
};

// Mapping for course images based on index
const courseImages = ["/Media.png", "/Media(1).png", "/Media(2).png"];
const courseIcons = ["Person", "Groups", "Work", "Psychology", "Gavel"];

interface Module {
  id: string;
  title: string;
  moduleNumber: number | null;
  description: string | null;
  courseId: string;
  createdAt: string;
}

interface CourseType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  isStandalone: boolean;
  createdAt: string;
  updatedAt: string;
  modules: Module[];
  hasAccess?: boolean;
  accessType?: "locked" | "purchased" | "subscription" | "trial";
  trialExpiresAt?: string | null;
}

export default function CoachingDetailPage() {
  const { isExpanded } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  const id = params?.id as string;

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${id}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        } else {
          console.error("Failed to fetch course");
        }
      } catch (error) {
        console.error("Error fetching course:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const handleStartTrial = async () => {
    if (!course) return;

    try {
      setEnrolling(true);
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: course.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        alert(
          `✓ Your 7-day free trial has started! Access expires on ${new Date(data.trialExpiresAt).toLocaleDateString()}`,
        );
        // Refresh course data to update access status
        const refreshResponse = await fetch(`/api/courses/${id}`);
        if (refreshResponse.ok) {
          const updatedCourse = await refreshResponse.json();
          setCourse(updatedCourse);
        }
      } else {
        const error = await response.json();
        alert(`Failed to start trial: ${error.error}`);
      }
    } catch (error) {
      console.error("Error starting trial:", error);
      alert("An error occurred while starting the trial. Please try again.");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/coaching")}
        >
          Back to Courses
        </BackButton>
        <div className="flex justify-center items-center h-screen text-gray-600">
          Loading course...
        </div>
      </StyledMainContent>
    );
  }

  if (!course) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/coaching")}
        >
          Back to Courses
        </BackButton>
        <div className="flex justify-center items-center h-screen text-red-500">
          Course not found
        </div>
      </StyledMainContent>
    );
  }

  // Determine icon and image based on course index (we can use a hash of the id for consistent selection)
  const courseIndex =
    parseInt(course.id.substring(0, 8), 16) % courseImages.length;
  const icon = courseIcons[courseIndex % courseIcons.length];
  const image = courseImages[courseIndex];

  const hasAccess = course.hasAccess ?? false;
  const isLocked = !hasAccess;

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "100px",
          marginBottom: "24px",
        }}
      >
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/coaching")}
          style={{ marginBottom: "0" }}
        ></BackButton>
        <h2
          style={{
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a1a",
            margin: 0,
          }}
        >
          {course.name}
        </h2>
      </div>

      <ImagePlaceholder>
        {!imageErrors[course.id] ? (
          <Image
            src={image}
            alt={course.name}
            fill
            style={{ objectFit: "cover" }}
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [course.id]: true }));
            }}
          />
        ) : (
          <PlaceholderText>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>
              <DynamicIcon iconName={icon} />
            </div>
            <div>{course.name}</div>
            <div style={{ fontSize: "14px", marginTop: "8px", opacity: 0.7 }}>
              Featured Image
            </div>
          </PlaceholderText>
        )}
      </ImagePlaceholder>

      <DetailContainer>
        <Header>
          <TitleSection>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: "0 0 8px 0",
              }}
            >
              Course Package
            </p>
            <Title>{course.name}</Title>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {isLocked && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  🔒 Locked
                </span>
              )}
              {hasAccess && course.accessType === "subscription" && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                  }}
                >
                  ✓ Included in Subscription
                </span>
              )}
              {hasAccess && course.accessType === "purchased" && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                  }}
                >
                  ✓ Purchased
                </span>
              )}
              {hasAccess && course.accessType === "trial" && (
                <span
                  style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    borderRadius: "16px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#fef3c7",
                    color: "#92400e",
                  }}
                >
                  ⏱️ Free Trial (
                  {course.trialExpiresAt
                    ? `Expires ${new Date(course.trialExpiresAt).toLocaleDateString()}`
                    : "Active"}
                  )
                </span>
              )}
            </div>
          </TitleSection>
        </Header>

        <ContentRow>
          <DescriptionColumn>
            <Description>
              {course.description ||
                "Explore this comprehensive course designed to provide you with in-depth knowledge and practical skills."}
            </Description>

            {/* Modules section */}
            {course.modules && course.modules.length > 0 && (
              <div style={{ marginTop: "24px" }}>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#1a1a1a",
                    marginBottom: "16px",
                  }}
                >
                  Course Modules ({course.modules.length})
                </h3>
                {isLocked && (
                  <div
                    style={{
                      padding: "16px",
                      backgroundColor: "#fef3c7",
                      borderRadius: "8px",
                      border: "1px solid #fbbf24",
                      marginBottom: "16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span style={{ fontSize: "24px" }}>🔒</span>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#92400e",
                        margin: 0,
                        fontWeight: "500",
                      }}
                    >
                      Purchase this course to unlock and access all modules
                    </p>
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {course.modules
                    .sort(
                      (a, b) => (a.moduleNumber || 0) - (b.moduleNumber || 0),
                    )
                    .map((module, index) => (
                      <div
                        key={module.id}
                        style={{
                          padding: "16px",
                          backgroundColor: isLocked ? "#f9fafb" : "#f8fafc",
                          borderRadius: "8px",
                          border: `1px solid ${isLocked ? "#e5e7eb" : "#e2e8f0"}`,
                          transition: "all 0.2s ease",
                          opacity: isLocked ? 0.6 : 1,
                          cursor: isLocked ? "not-allowed" : "pointer",
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          if (!isLocked) {
                            e.currentTarget.style.backgroundColor = "#f1f5f9";
                            e.currentTarget.style.borderColor = "#cbd5e1";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isLocked) {
                            e.currentTarget.style.backgroundColor = "#f8fafc";
                            e.currentTarget.style.borderColor = "#e2e8f0";
                          }
                        }}
                        onClick={(e) => {
                          if (isLocked) {
                            e.preventDefault();
                            alert(
                              "This module is locked. Purchase the course to access it.",
                            );
                          }
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                            marginBottom: module.description ? "8px" : "0",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              backgroundColor: isLocked ? "#9ca3af" : "#1e3a8a",
                              color: "white",
                              fontSize: "14px",
                              fontWeight: "600",
                            }}
                          >
                            {module.moduleNumber || index + 1}
                          </span>
                          <span
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: isLocked ? "#6b7280" : "#1a1a1a",
                              flex: 1,
                            }}
                          >
                            {module.title}
                          </span>
                          {isLocked && (
                            <span
                              style={{
                                fontSize: "16px",
                                color: "#9ca3af",
                              }}
                            >
                              🔒
                            </span>
                          )}
                        </div>
                        {module.description && !isLocked && (
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#64748b",
                              margin: "0 0 0 44px",
                              lineHeight: "1.6",
                            }}
                          >
                            {module.description}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </DescriptionColumn>

          <ButtonColumn>
            <ActionButtons>
              {!hasAccess ? (
                <>
                  <div style={{ marginBottom: "16px" }}>
                    {/* Package Card 1 */}
                    <div
                      style={{
                        padding: "16px 20px",
                        marginBottom: "12px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#1e3a8a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#e2e8f0")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "4px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                            letterSpacing: "0.5px",
                          }}
                        >
                          12 MONTHS
                        </span>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                          }}
                        >
                          ${((course.price * 12) / 52).toFixed(2)}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          7 day free trial
                        </span>
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                          }}
                        >
                          ${(course.price / 4.33).toFixed(2)}/week
                        </span>
                      </div>
                    </div>

                    {/* 1 Week Package */}
                    <div
                      style={{
                        padding: "16px 20px",
                        border: "2px solid #e2e8f0",
                        borderRadius: "8px",
                        backgroundColor: "white",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = "#1e3a8a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = "#e2e8f0")
                      }
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "18px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                            letterSpacing: "0.5px",
                          }}
                        >
                          1 WEEK
                        </span>
                        <span
                          style={{
                            fontSize: "20px",
                            fontWeight: "700",
                            color: "#1a1a1a",
                          }}
                        >
                          ${course.price.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    size="large"
                    onClick={hasAccess ? undefined : handleStartTrial}
                    disabled={enrolling}
                    sx={{
                      background: hasAccess ? "#059669" : "#1e7fbf",
                      "&:hover": {
                        background: hasAccess ? "#047857" : "#1562a0",
                      },
                      textTransform: "none",
                      fontSize: "16px",
                      padding: "14px 32px",
                      width: "100%",
                      fontWeight: "600",
                    }}
                  >
                    {enrolling
                      ? "Starting trial..."
                      : hasAccess
                        ? "Access Course"
                        : "Start your 7-day free trial"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => {
                    console.log("Already has access to:", course.id);
                    // TODO: Navigate to course content
                  }}
                  sx={{
                    background: "#059669",
                    "&:hover": {
                      background: "#047857",
                    },
                    textTransform: "none",
                    fontSize: "16px",
                    padding: "14px 32px",
                    width: "100%",
                    fontWeight: "600",
                  }}
                >
                  Access Course
                </Button>
              )}
            </ActionButtons>
          </ButtonColumn>
        </ContentRow>
      </DetailContainer>
    </StyledMainContent>
  );
}
