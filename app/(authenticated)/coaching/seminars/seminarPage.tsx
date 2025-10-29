"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import RecordVoiceOverOutlinedIcon from "@mui/icons-material/RecordVoiceOverOutlined";
import { useUser } from "@clerk/nextjs";
import SeminarReserve from "@/app/components/SeminarReserve";
import { useRouter } from "next/navigation";

const DetailContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
`;

const HeaderActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled(Button)`
  color: #6366f1;
  text-transform: none;
  font-size: 16px;
  &:hover {
    background-color: rgba(99, 102, 241, 0.1);
  }
`;

const AdminActions = styled.div`
  display: flex;
  gap: 12px;
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
  background-color: #1e3a8a;
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

const AttendeeInfo = styled.div`
  background: #f1f5f9;
  border-radius: 12px;
  padding: 20px;
  margin-top: 32px;
  color: #1e293b;
`;

export interface Seminar {
  id: string;
  title: string;
  hostName: string;
  image?: string;
  mediaUrl?: string;
  description?: string;
  accessType?: "public" | "private";
  date?: string;
  duration?: number;
  zoomLink?: string;
}

interface Attendee {
  id: string;
  name: string;
  email: string;
}

interface SeminarDetailProps {
  seminar: Seminar;
  onBack: () => void;
  onReservationSuccess?: () => void;
}

export default function SeminarDetail({ seminar, onBack }: SeminarDetailProps) {
  const [openReservation, setOpenReservation] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const router = useRouter();

  // Check if current user is admin
  useEffect(() => {
    async function fetchAdminStatus() {
      try {
        const res = await fetch("/api/check-admin");
        setIsAdmin(res.ok);
      } catch (err) {
        console.error("Error checking admin:", err);
      }
    }
    fetchAdminStatus();
  }, []);
  useEffect(() => {
    async function fetchSeminarData() {
      try {
        const res = await fetch(`/api/seminar/${seminar.id}`);
        if (res.ok) {
          const data = await res.json();
          setAttendees(data.attendees || []);
        }
      } catch (err) {
        console.error("Error fetching seminar:", err);
      }
    }
    fetchSeminarData();
  }, [seminar.id]);

  const handleReservation = () => {
    if (!isLoaded) return;
    if (!isSignedIn || !user) {
      alert("Please sign in to reserve a spot.");
      return;
    }
    setOpenReservation(true);
  };

  const handleCloseReservation = () => setOpenReservation(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this seminar?")) return;
    try {
      const res = await fetch(`/api/seminar/${seminar.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "❌ Failed to delete seminar.");
        return;
      }
      alert("✅ Seminar deleted successfully!");

      onBack();
      setTimeout(() => {
        window.location.href = "/coaching?tab=Seminars";
      }, 300);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = () => {
    window.location.href = `/coaching/seminars/edit/${seminar.id}`;
  };

  const handleExport = () => {
    if (attendees.length === 0) {
      alert("No attendees to export.");
      return;
    }
    const csvContent = [
      ["Name", "Email"].join(","),
      ...attendees.map((a) => [a.name, a.email].join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${seminar.title}_attendees.csv`;
    link.click();
  };

  const renderMedia = (url?: string) => {
    if (!url) return null;
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(url);
    const fullUrl = url.startsWith("/uploads")
      ? `${window.location.origin}${url}`
      : url;

    return isVideo ? (
      <video
        controls
        playsInline
        style={{
          width: "100%",
          borderRadius: "12px",
          backgroundColor: "#000",
        }}
      >
        <source src={fullUrl} type="video/mp4" />
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
      <HeaderActions>
        <BackButton startIcon={<ArrowBackIcon />} onClick={onBack}>
          Back to Seminars
        </BackButton>

        {isAdmin && (
          <AdminActions>
            <Button
              startIcon={<EditIcon />}
              variant="outlined"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              startIcon={<DeleteIcon />}
              color="error"
              variant="outlined"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              color="primary"
              variant="contained"
              onClick={handleExport}
            >
              Export Attendees
            </Button>
          </AdminActions>
        )}
      </HeaderActions>

      <ContentGrid>
        {/* LEFT SECTION */}
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
              <RecordVoiceOverOutlinedIcon />
              <span>Host: {seminar.hostName}</span>
            </InfoItem>
            <InfoItem>
              <GroupsIcon />
              <span>Attendees: {attendees.length}</span>
            </InfoItem>
          </InfoSection>

          {!isAdmin && (
            <ReservationButton onClick={handleReservation} disabled={!isLoaded}>
              {!isLoaded ? "Loading..." : "Reserve Your Spot"}
            </ReservationButton>
          )}
          {isAdmin && seminar.zoomLink && (
            <InfoSection>
              <InfoTitle>Zoom Meeting</InfoTitle>
              <InfoItem>
                <AccessTimeIcon />
                <span>
                  <strong>Meeting Link:</strong>{" "}
                  <a
                    href={seminar.zoomLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#6366f1", fontWeight: 500 }}
                  >
                    {seminar.zoomLink}
                  </a>
                </span>
              </InfoItem>
            </InfoSection>
          )}

          {isAdmin && attendees.length > 0 && (
            <AttendeeInfo>
              <strong>Attendee List:</strong>
              <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                {attendees.map((a) => (
                  <li key={a.id}>
                    {a.name} — {a.email}
                  </li>
                ))}
              </ul>
            </AttendeeInfo>
          )}
        </LeftSection>

        {/* RIGHT SECTION */}
        {(seminar.mediaUrl || seminar.image) && (
          <RightSection>
            <VideoTitle>Seminar Introduction</VideoTitle>
            {renderMedia(seminar.mediaUrl || seminar.image)}
          </RightSection>
        )}
      </ContentGrid>

      {/* RESERVATION DIALOG */}
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
