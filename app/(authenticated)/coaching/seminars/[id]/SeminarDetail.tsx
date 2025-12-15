"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { Button } from "@mui/material";
import {
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon,
  Groups as GroupsIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  RecordVoiceOverOutlined as RecordVoiceOverOutlinedIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material";
import { useUser } from "@clerk/nextjs";
import SeminarReserve from "@/app/components/SeminarReserve";
import { useSearchParams, useRouter } from "next/navigation";

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

export interface AccessRule {
  id: string;
  accessScope: "public" | "community" | "membership";
  price?: number | null;
  communityId?: string | null;
  tierId?: string | null;
  community?: { name: string } | null;
  tier?: { tierName: string } | null;
}

export interface Seminar {
  id: string;
  title: string;
  description?: string;
  hostName: string;
  date?: string;
  duration?: number;
  zoomLink?: string;
  mediaUrl?: string;
  image?: string;
  attendees?: { id: string; name: string; email: string }[];
  accessRules?: AccessRule[];
}

interface SeminarDetailProps {
  seminar: Seminar;
  openReservation: boolean;
  setOpenReservation: (value: boolean) => void;
}

export default function SeminarDetail({
  seminar,
  openReservation,
  setOpenReservation,
}: SeminarDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoaded, isSignedIn } = useUser();

  const [attendees, setAttendees] = useState(seminar.attendees || []);
  const [accessRules, setAccessRules] = useState(seminar.accessRules || []);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // New added states for rule-based locking
  const [userCommunities, setUserCommunities] = useState<string[]>([]);
  const [userTiers, setUserTiers] = useState<string[]>([]);

  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";

  useEffect(() => {
    async function fetchAdminStatus() {
      try {
        const res = await fetch("/api/check-admin");
        setIsAdmin(res.ok);
      } catch (err) {
        console.error("Failed to check admin:", err);
      }
    }
    fetchAdminStatus();
  }, []);

  useEffect(() => {
    async function loadSeminar() {
      const res = await fetch(`/api/seminar/${seminar.id}`);
      if (!res.ok) return;
      const data = await res.json();

      setAttendees(data.attendees || []);
      setAccessRules(data.accessRules || []);
    }
    loadSeminar();
  }, [seminar.id]);

  useEffect(() => {
    if (!isSignedIn) return;

    async function loadUserAccess() {
      const res = await fetch("/api/user-profile");
      if (!res.ok) return;

      const data = await res.json();
      setUserCommunities(data.communities.map((c: any) => c.id));
      setUserTiers(data.tiers.map((t: any) => t.id));
    }

    loadUserAccess();
  }, [isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !accessRules) return;

    if (isAdmin) {
      setIsLocked(false);
      return;
    }

    let locked = false;

    for (const rule of accessRules) {
      switch (rule.accessScope) {
        case "public":
          break;

        case "community":
          if (rule.communityId && !userCommunities.includes(rule.communityId)) {
            locked = true;
          }
          break;

        case "membership":
          if (rule.tierId && !userTiers.includes(rule.tierId)) {
            locked = true;
          }
          break;

        default:
          locked = true;
      }
    }

    setIsLocked(locked);
  }, [accessRules, userCommunities, userTiers, isAdmin, isLoaded]);

  const hasReserved = attendees.some(
    (att) => att.email.toLowerCase() === userEmail.toLowerCase(),
  );

  useEffect(() => {
    const paidSeminar = searchParams.get("paidSeminar");
    if (paidSeminar && String(paidSeminar) === seminar.id) {
      setOpenReservation(true);
    }
  }, [searchParams]);

  const handleReservation = async () => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      alert("Please sign in to reserve.");
      return;
    }

    if (isLocked) {
      alert("You do not meet access requirements for this seminar.");
      return;
    }

    if (hasReserved) {
      alert("You already reserved this seminar.");
      return;
    }

    const paidRule = accessRules.find((r) => r.price && r.price > 0);

    if (!paidRule) {
      setOpenReservation(true);
      return;
    }

    try {
      setLoadingCheckout(true);
      const res = await fetch("/api/checkout-seminar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seminarId: seminar.id,
          title: seminar.title,
          price: paidRule.price,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        alert("Failed to start checkout.");
        return;
      }

      window.location.href = data.url;
    } finally {
      setLoadingCheckout(false);
    }
  };

  const handleEdit = () =>
    (window.location.href = `/coaching/seminars/edit/${seminar.id}`);

  const handleDelete = async () => {
    if (!confirm("Delete this seminar?")) return;

    const res = await fetch(`/api/seminar/${seminar.id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Failed to delete seminar.");
      return;
    }

    alert("Seminar deleted.");

    window.location.href = "/coaching?tab=Seminars";
  };

  const handleExport = () => {
    if (attendees.length === 0) {
      alert("No attendees to export.");
      return;
    }

    const csv = [
      "Name,Email",
      ...attendees.map((a) => `${a.name},${a.email}`),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${seminar.title}_attendees.csv`;
    link.click();
  };

  const renderMedia = (url: string | undefined) => {
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
        alt=""
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
        <BackButton
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/coaching?tab=Seminars")}
        >
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
              Export
            </Button>
          </AdminActions>
        )}
      </HeaderActions>

      {/* 🔒 LOCKED BANNER */}
      {isLocked && !isAdmin && (
        <div
          style={{
            background: "#f9fafb",
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            padding: "16px 20px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <svg width="22" height="22" fill="#6366f1" viewBox="0 0 24 24">
            <path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
            <path
              fillRule="evenodd"
              d="M6 8V7a6 6 0 1 1 12 0v1a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V10a2 2 0 0 1 2-2zm2-1a4 4 0 1 1 8 0v1H8V7zm10 4H6v9h12v-9z"
            />
          </svg>
          <div>
            <strong style={{ color: "#111827" }}>Locked Seminar</strong>
            <p style={{ margin: 0, color: "#4b5563" }}>
              You don’t meet the access rules for this seminar.
            </p>
          </div>
        </div>
      )}

      <ContentGrid>
        {/* LEFT */}
        <LeftSection>
          <WorkshopTitle>{seminar.title}</WorkshopTitle>
          <WorkshopDescription>{seminar.description}</WorkshopDescription>

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

            {accessRules.map((rule) => {
              const communityName = rule.community?.name;
              const tierName = rule.tier?.tierName;

              return (
                <div key={rule.id}>
                  <InfoItem>
                    <GroupsIcon />
                    {rule.accessScope === "public" && (
                      <span>Open to everyone</span>
                    )}
                    {rule.accessScope === "community" && (
                      <span>
                        Only open to community: <strong>{communityName}</strong>
                      </span>
                    )}
                    {rule.accessScope === "membership" && (
                      <span>
                        Only for membership tier: <strong>{tierName}</strong>
                      </span>
                    )}
                  </InfoItem>

                  {rule.price && (
                    <InfoItem>
                      <AttachMoneyIcon />
                      <span>Price: ${rule.price.toFixed(2)}</span>
                    </InfoItem>
                  )}
                </div>
              );
            })}
          </InfoSection>

          {!isAdmin && (
            <ReservationButton
              onClick={handleReservation}
              disabled={loadingCheckout || hasReserved}
            >
              {loadingCheckout
                ? "Redirecting..."
                : hasReserved
                  ? "Already Reserved"
                  : "Reserve Your Spot"}
            </ReservationButton>
          )}

          {isAdmin && seminar.zoomLink && (
            <InfoSection>
              <InfoTitle>Zoom Link</InfoTitle>
              <InfoItem>
                <AccessTimeIcon />
                <a
                  href={seminar.zoomLink}
                  target="_blank"
                  style={{ color: "#6366f1" }}
                  rel="noreferrer"
                >
                  {seminar.zoomLink}
                </a>
              </InfoItem>
            </InfoSection>
          )}

          {isAdmin && attendees.length > 0 && (
            <AttendeeInfo>
              <strong>Attendees:</strong>
              <ul>
                {attendees.map((a) => (
                  <li key={a.id}>
                    {a.name} — {a.email}
                  </li>
                ))}
              </ul>
            </AttendeeInfo>
          )}
        </LeftSection>

        {/* RIGHT */}
        {(seminar.mediaUrl || seminar.image) && (
          <RightSection>
            <VideoTitle>Seminar Introduction</VideoTitle>
            {renderMedia(seminar.mediaUrl || seminar.image)}
          </RightSection>
        )}
      </ContentGrid>

      {/* Reservation modal */}
      {isLoaded && isSignedIn && (
        <SeminarReserve
          open={openReservation}
          onClose={() => setOpenReservation(false)}
          seminar={seminar}
          userEmail={userEmail}
        />
      )}
    </DetailContainer>
  );
}
