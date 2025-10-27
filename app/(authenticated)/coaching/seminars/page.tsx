"use client";

import { useState } from "react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SeminarReserve from "@/app/components/SeminarReserve";
import { useUser } from "@clerk/nextjs";

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
  &:disabled {
    background-color: #cbd5e1;
    color: #64748b;
  }
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const VideoTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  text-align: center;
`;

export interface Seminar {
  id: string;
  image?: string;
  mediaUrl?: string;
  title: string;
  description?: string;
  hostName: string;
  accessType?: "public" | "private";
  date?: string;
  duration?: number;
  zoomLink?: string;
}

interface SeminarsProps {
  seminar: Seminar;
  onBack: () => void;
  onReservationSuccess?: () => void;
}

export default function Seminars({ seminar, onBack }: SeminarsProps) {
  const [openReservation, setOpenReservation] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // 👈 added toggle state
  const { user, isLoaded, isSignedIn } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  const handleReservation = () => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      alert("Please sign in to reserve a spot");
      return;
    }
    setOpenReservation(true);
  };

  const handleCloseReservation = () => setOpenReservation(false);

  // ✅ Dynamic media renderer
  const renderMedia = (url?: string) => {
    if (!url) return null;

    const lowerUrl = url.toLowerCase();
    const isVideo = lowerUrl.match(/\.(mp4|mov|avi|webm)$/i);

    const fileType =
      lowerUrl.endsWith(".mov")
        ? "video/quicktime"
        : lowerUrl.endsWith(".webm")
        ? "video/webm"
        : "video/mp4";

    const fullUrl = url.startsWith("/uploads")
      ? `${typeof window !== "undefined" ? window.location.origin : ""}${url}`
      : url;

    return isVideo ? (
      <video
        key={fullUrl}
        controls
        autoPlay
        playsInline
        preload="metadata"
        style={{
          width: "100%",
          maxHeight: "400px",
          borderRadius: "12px",
          backgroundColor: "#000",
        }}
        onLoadedData={() => console.log("✅ Video loaded:", fullUrl)}
        onError={(e) => console.error("❌ Video load error:", e)}
      >
        <source src={fullUrl} type={fileType} />
        Your browser does not support the video tag.
      </video>
    ) : (
      <img
        src={fullUrl}
        alt="Seminar media"
        style={{
          width: "100%",
          borderRadius: "12px",
          objectFit: "cover",
        }}
      />
    );
  };

  return (
    <DetailContainer>
      <BackButton startIcon={<ArrowBackIcon />} onClick={onBack}>
        Back to Seminars
      </BackButton>

      <ContentGrid>
        {/* Left Side */}
        <LeftSection>
          <WorkshopTitle>{seminar.title}</WorkshopTitle>
          <WorkshopDescription>
            {seminar.description ||
              "Join us for an engaging workshop experience designed to help you grow and develop new skills."}
          </WorkshopDescription>

          <InfoSection>
            <InfoTitle>Seminar Details</InfoTitle>
            <InfoItem>
              <CalendarTodayIcon />
              <span>
                Date:{" "}
                {seminar.date
                  ? new Date(seminar.date).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "TBA"}
              </span>
            </InfoItem>
            <InfoItem>
              <AccessTimeIcon />
              <span>Duration: {seminar.duration || "TBA"} mins</span>
            </InfoItem>
            <InfoItem>
              <GroupsIcon />
              <span>Host: {seminar.hostName}</span>
            </InfoItem>
          </InfoSection>

          <ReservationButton onClick={handleReservation} disabled={!isLoaded}>
            {!isLoaded ? "Loading..." : "Reserve Your Spot"}
          </ReservationButton>
        </LeftSection>

        {/* Right Side */}
        <RightSection>
          <div>
            <VideoTitle>Seminar Introduction</VideoTitle>

            {showVideo && seminar.mediaUrl ? (
              renderMedia(seminar.mediaUrl)
            ) : (
              <div
                onClick={() => setShowVideo(true)}
                style={{
                  width: "100%",
                  height: "250px",
                  borderRadius: "12px",
                  backgroundColor: "#000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                {seminar.image && (
                  <img
                    src={seminar.image}
                    alt="Seminar cover"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "12px",
                      opacity: 0.6,
                    }}
                  />
                )}
                <PlayArrowIcon
                  style={{
                    fontSize: 64,
                    color: "white",
                    position: "absolute",
                  }}
                />
              </div>
            )}
          </div>
        </RightSection>
      </ContentGrid>

      {/* Reservation Dialog */}
      {isLoaded && isSignedIn && (
        <SeminarReserve
          open={openReservation}
          onClose={handleCloseReservation}
          seminar={seminar}
          userEmail={userEmail}
        />
      )}
    </DetailContainer>
  );
}
