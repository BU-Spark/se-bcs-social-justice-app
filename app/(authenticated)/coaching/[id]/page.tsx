"use client";

import { useSidebar } from "@/app/components/SidebarContext";
import styled from "@emotion/styled";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CircularProgress, Button } from "@mui/material";
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
  height: 400px;
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
  gap: 16px;
  margin-top: 32px;
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

interface AppointmentType {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  accessType: string;
  createdAt: string;
  updatedAt: string;
}

export default function CoachingDetailPage() {
  const { isExpanded } = useSidebar();
  const params = useParams();
  const router = useRouter();
  const [appointmentType, setAppointmentType] = useState<AppointmentType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const id = params?.id as string;

  useEffect(() => {
    const fetchAppointmentType = async () => {
      try {
        const response = await fetch(`/api/appointment-types/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch appointment type");
        }
        const data = await response.json();
        setAppointmentType(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load appointment type"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAppointmentType();
    }
  }, [id]);

  if (loading) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <div className="flex justify-center items-center h-screen">
          <CircularProgress />
        </div>
      </StyledMainContent>
    );
  }

  if (error || !appointmentType) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/coaching")}
        >
          Back to Coaching
        </BackButton>
        <div className="flex justify-center items-center h-screen text-red-500">
          {error || "Appointment type not found"}
        </div>
      </StyledMainContent>
    );
  }

  const isPrivate = appointmentType.accessType === "private";
  const formattedDate = new Date(appointmentType.createdAt).toLocaleDateString(
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
         Be The Messenger Framework
        </h2>
        </div>

      {/* Add this image placeholder */}
      <ImagePlaceholder>
        <PlaceholderText>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            <DynamicIcon iconName={appointmentType.icon} />
          </div>
          <div>{appointmentType.title}</div>
          <div style={{ fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
            Featured Image
          </div>
        </PlaceholderText>
      </ImagePlaceholder>

      <DetailContainer>
        <Header>
          <IconContainer>
            <DynamicIcon iconName={appointmentType.icon} />
          </IconContainer>
          <TitleSection>
            <Title>{appointmentType.title}</Title>
            <p> Coaching Package</p>
          </TitleSection>
        </Header>


        <Description>
        {appointmentType.description || "No description available."}
        </Description>

        {!isPrivate && (
          <ActionButtons>
            <Button
              variant="contained"
              size="large"
              startIcon={<CalendarTodayIcon />}
              onClick={() => router.push(`/scheduling?typeId=${appointmentType.id}`)}
              sx={{
                background: "#1e3a8a",  /* Changed to match sidebar */
                "&:hover": {
                  background: "#1e40af",  /* bg-blue-800 for hover */
                },
                textTransform: "none",
                fontSize: "16px",
                padding: "12px 32px",
              }}
            >
              Schedule Appointment
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "#1e3a8a",  /* Sidebar blue */
                color: "#1e3a8a",
                "&:hover": {
                  borderColor: "#1e40af",
                  background: "rgba(30, 58, 138, 0.04)",  /* Light blue tint on hover */
                },
                textTransform: "none",
                fontSize: "16px",
                padding: "12px 32px",
              }}
            >
              Learn More
            </Button>
          </ActionButtons>
        )}

        {isPrivate && (
          <div
            style={{
              padding: "20px",
              background: "#fef3c7",
              borderRadius: "8px",
              color: "#92400e",
              marginTop: "24px",
            }}
          >
            <strong>Private Access Only:</strong> This coaching package requires
            special permissions. Please contact an administrator for access.
          </div>
        )}
      </DetailContainer>
    </StyledMainContent>
  );
}