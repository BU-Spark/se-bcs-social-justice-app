"use client";

import styled from "@emotion/styled";
import { Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const BackButton = styled(Button)`
  margin-bottom: 24px;
  color: #6366f1;
  text-transform: none;
  font-size: 16px;

  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
  }
`;

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
`;

const WorkshopTitle = styled.h1`
  font-size: 36px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 24px;
  line-height: 1.3;
`;

const WorkshopDescription = styled.p`
  font-size: 16px;
  line-height: 1.8;
  color: #4a5568;
  margin-bottom: 32px;
`;

const InfoSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
`;

const InfoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: #4a5568;
  font-size: 15px;

  svg {
    color: #6366f1;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const ReservationButton = styled(Button)`
  background-color: #6366f1;
  color: white;
  padding: 16px 48px;
  font-size: 16px;
  font-weight: 600;
  text-transform: none;
  border-radius: 8px;
  width: fit-content;

  &:hover {
    background-color: #4f46e5;
  }
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const VideoPlaceholder = styled.div`
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  width: 100%;
  padding-bottom: 56.25%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const PlayButton = styled.button`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: white;
    transform: translate(-50%, -50%) scale(1.1);
  }

  svg {
    font-size: 40px;
    color: #6366f1;
  }
`;

const VideoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-top: 12px;
`;

interface Workshop {
  id: string;
  typeName: string;
  description: string;
  icon: string;
  longDescription?: string;
}

interface CoachingWorkshopsProps {
  workshop: Workshop;
  onBack: () => void;
}

export default function CoachingWorkshops({
  workshop,
  onBack,
}: CoachingWorkshopsProps) {
  const handleReservation = () => {
    console.log("Reserve workshop:", workshop.id);
    alert("Reservation feature coming soon!");
  };

  const handleVideoPlay = () => {
    console.log("Play video for workshop:", workshop.id);
    alert("Video player coming soon!");
  };

  return (
    <DetailContainer>
      <BackButton startIcon={<ArrowBackIcon />} onClick={onBack}>
        Back to Workshops
      </BackButton>

      <ContentGrid>
        <LeftSection>
          <WorkshopTitle>{workshop.typeName}</WorkshopTitle>
          <WorkshopDescription>
            {workshop.longDescription ||
              workshop.description ||
              "Join us for an engaging workshop experience designed to help you grow and develop new skills"}
          </WorkshopDescription>

          <InfoSection>
            <InfoTitle>Workshop Details</InfoTitle>
            <InfoItem>
              <CalendarTodayIcon />
              <span>Date: TBA (To be scheduled)</span>
            </InfoItem>
            <InfoItem>
              <AccessTimeIcon />
              <span>Duration: 2 hours</span>
            </InfoItem>
            <InfoItem>
              <GroupsIcon />
              <span>Format: Group Session</span>
            </InfoItem>
          </InfoSection>

          <ReservationButton onClick={handleReservation}>
            Reserve Your Spot
          </ReservationButton>
        </LeftSection>

        <RightSection>
          <div>
            <VideoPlaceholder>
              <PlayButton onClick={handleVideoPlay}>
                <PlayArrowIcon />
              </PlayButton>
            </VideoPlaceholder>
            <VideoTitle>Workshop Preview Video</VideoTitle>
          </div>

          <div>
            <VideoPlaceholder>
              <PlayButton onClick={handleVideoPlay}>
                <PlayArrowIcon />
              </PlayButton>
            </VideoPlaceholder>
            <VideoTitle>Introduction to the Facilitator</VideoTitle>
          </div>
        </RightSection>
      </ContentGrid>
    </DetailContainer>
  );
}
