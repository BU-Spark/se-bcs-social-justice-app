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
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
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
  background: #1e3a8a;  /* Changed to match sidebar bg-blue-900 */
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
  flex-direction: column;  /* Changed from row to column */
  gap: 16px;
  margin-top: 0;  /* Changed from 32px to 0 */
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

// Add placeholder courses data (same as in page.tsx)
const placeholderCourses = [
  {
    id: "course-1",
    title: "Be The Messenger Framework",
    description: "This comprehensive course teaches you how to become an effective messenger for social justice. Through interactive sessions and real-world examples, you'll learn the art of communication, advocacy, and leadership in promoting social change.",
    icon: "Person",
    accessType: "private",
    createdAt: new Date().toISOString(),
    image: "/Media.png",
    keyOutcomes: [
      "Leadership clarity",
      "Stronger decision-making",
      "Susstainable culture change"
    ]
  },
  {
    id: "course-2",
    title: "Community Leadership Course",
    description: "Develop essential leadership skills for community organizing and grassroots movements. This course covers strategic planning, team building, conflict resolution, and sustainable community engagement practices.",
    icon: "Groups",
    accessType: "public",
    createdAt: new Date().toISOString(),
    image: "/Media(1).png",
    keyOutcomes: [
      "Courageous leadership",
      "Improved workplace culture",
      "Stronger institutional accountability"
    ]
  },
  {
    id: "course-3",
    title: "Workplace Culture Transformation",
    description: "Transform your workplace culture through inclusive practices and equity-focused strategies. Learn how to identify systemic barriers, implement inclusive policies, and create lasting organizational change.",
    icon: "Work",
    accessType: "private",
    createdAt: new Date().toISOString(),
    image: "/Media(2).png",
    keyOutcomes: [
      "Facultry development",,
      "Strengthened research capacity",
      "Institutional transformation"
    ]
  },
];

interface CourseType {
  id: string;
  title: string;
  description: string;
  icon: string;
  accessType: string;
  createdAt: string;
  image: string;
  keyOutcomes: string[];
}

export default function CoachingDetailPage() {
  const { isExpanded } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<CourseType | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const id = params?.id as string;

  useEffect(() => {
    // Find course from placeholder data instead of API
    const foundCourse = placeholderCourses.find(c => c.id === id);
    if (foundCourse) {
      setCourse(foundCourse);
    }
  }, [id]);

  // Remove loading state since we're using local data
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

  const isPrivate = course.accessType === "private";
  const formattedDate = new Date(course.createdAt).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  );

  return (
    <StyledMainContent isExpanded={isExpanded}>
        <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        gap: '100px',
        marginBottom: '24px' 
      }}>
            <BackButton
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push("/coaching")}
            color="black"
            style={{marginBottom: '0'}}
            >
            </BackButton>
            <h2 style={{ 
          fontSize: '24px', 
          fontWeight: '600', 
          color: '#1a1a1a',
          margin: 0 
        }}>
          {course.title}
        </h2>
        </div>

      <ImagePlaceholder>
        {!imageErrors[course.id] ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            style={{ objectFit: "cover" }}
            onError={() => {
              setImageErrors((prev) => ({ ...prev, [course.id]: true }));
            }}
          />
        ) : (
        <PlaceholderText>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              <DynamicIcon iconName={course.icon} />
          </div>
            <div>{course.title}</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
            Featured Image
          </div>
        </PlaceholderText>
        )}
      </ImagePlaceholder>

      <DetailContainer>
        <Header>
          <TitleSection>
            <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 8px 0' }}>Course Package</p>
            <Title>{course.title}</Title>
            {isPrivate ? 
              (<p style={{ fontSize: '14px', color: 'red', margin: '0 0 8px 0' }}>Private</p>) :
              (<p style={{ fontSize: '14px', color: 'green', margin: '0 0 8px 0' }}>Public</p>)
            }
          </TitleSection>
        </Header>

        <ContentRow>
          <DescriptionColumn>
            <Description>
              {course.description}
            </Description>
            
            {/* Key Outcomes section */}
            <div style={{ marginTop: '24px' }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                color: '#1a1a1a',
                marginBottom: '16px'
              }}>
                Key Outcomes
              </h3>
              <ul style={{
                fontSize: '16px',
                lineHeight: '1.8',
                color: '#64748b',
                paddingLeft: '24px',
                margin: 0
              }}>
                {course.keyOutcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </div>
          </DescriptionColumn>

          <ButtonColumn>
            <ActionButtons>
              {isPrivate ? (
                <>
                  <div style={{ marginBottom: '16px' }}>
                    {/* Package Card 1 */}
                    <div style={{
                      padding: '16px 20px',
                      marginBottom: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1e3a8a'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: '#1a1a1a',
                          letterSpacing: '0.5px'
                        }}>12 MONTHS</span>
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#1a1a1a' 
                        }}>$68.99</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>7 day free trial</span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>$1.34/week</span>
                      </div>
                    </div>

                    {/* Package Card 2 */}
                    <div style={{
                      padding: '16px 20px',
                      marginBottom: '12px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1e3a8a'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: '#1a1a1a',
                          letterSpacing: '0.5px'
                        }}>1 MONTH</span>
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#1a1a1a' 
                        }}>$15.99</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>7 day free trial</span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>$1.34/week</span>
                      </div>
                    </div>

                    {/* Package Card 3 */}
                    <div style={{
                      padding: '16px 20px',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#1e3a8a'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
                    >
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '18px', 
                          fontWeight: '700', 
                          color: '#1a1a1a',
                          letterSpacing: '0.5px'
                        }}>1 WEEK</span>
                        <span style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#1a1a1a' 
                        }}>$10.99</span>
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center'
                      }}>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>7 day free trial</span>
                        <span style={{ 
                          fontSize: '13px', 
                          color: '#64748b' 
                        }}>$1.34/week</span>
                      </div>
                    </div>
                </div>

                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => {
                      console.log("Purchase clicked for:", course.id);
                    }}
                    sx={{
                      background: "#1e3a8a",
                      "&:hover": {
                        background: "#1e40af",
                      },
                      textTransform: "none",
                      fontSize: "16px",
                      padding: "12px 32px",
                      width: "100%",
                    }}
                  >
                    Start Your 7 day free trial
                  </Button>
                  
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<CalendarTodayIcon />}
                    onClick={() => router.push(`/scheduling?typeId=${course.id}`)}
                    sx={{
                      background: "#1e3a8a",
                      "&:hover": {
                        background: "#1e40af",
                      },
                      textTransform: "none",
                      fontSize: "16px",
                      padding: "12px 32px",
                      width: "100%",
                    }}
                  >
                    Schedule Appointment
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: "#1e3a8a",
                      color: "#1e3a8a",
                      "&:hover": {
                        borderColor: "#1e40af",
                        background: "rgba(30, 58, 138, 0.04)",
                      },
                      textTransform: "none",
                      fontSize: "16px",
                      padding: "12px 32px",
                      width: "100%",
                    }}
                  >
                    Learn More
                  </Button>
                </>
              )}
            </ActionButtons>
          </ButtonColumn>
        </ContentRow>
      </DetailContainer>
    </StyledMainContent>
  );
}