"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../../components/SidebarContext";
import { useRouter } from "next/navigation";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${({ isExpanded }) => (isExpanded ? "256px" : "64px")});
`;

const StyledContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
`;

const StyledTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const StyledFilterContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const StyledFilterButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  background: ${({ active }) => (active ? "royalblue" : "aliceblue")};
  color: ${({ active }) => (active ? "white" : "black")};
  cursor: pointer;
`;

const StyledCard = styled.div`
  border: 1px solid aliceblue;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  background: white;
`;

const StyledCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  padding: 4px 8px;
  border-radius: 4px;
  background: ${({ status }) => {
    switch (status) {
      case "PENDING":
        return "orange";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "tomato";
      default:
        return "slategray";
    }
  }};
  color: white;
  font-size: 14px;
`;

type LeaderApplication = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentlyInvolved: boolean;
  background: string;
  hasLedGroup: boolean;
  previousRole: string;
  focusTopics: string;
  motivation: string;
  leadershipStyle: string;
  inclusiveEnvironment: string;
  conflictHandling: string;
  comfortableWithTopics: boolean;
  engagementStrategies: string;
  meetingFrequency: string;
  availableForOnboarding: boolean;
  willFollowGuidelines: boolean;
  questions: string | null;
  referenceName: string;
  referenceContact: string;
  referenceRelationship: string;
  videoUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    username?: string;
    imageUrl?: string;
    phoneNumber?: string;
  };
};

export default function AdminLeaderApplications() {
  const { isExpanded } = useSidebar();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [applications, setApplications] = useState<LeaderApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("PENDING");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await fetch("/api/check-admin");
        if (res.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          router.push("/dashboard");
        }
      } catch (error) {
        setIsAdmin(false);
        router.push("/dashboard");
      }
    };
    checkAdmin();
  }, [router]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/leader-applications?status=${filter}`);
      if (!res.ok) {
        if (res.status === 403) {
          setError("You don't have permission to access this page.");
          router.push("/dashboard");
          return;
        }
        throw new Error(res.statusText);
      }
      const data = await res.json();
      setApplications(data.applications);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load applications"
      );
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchApplications();
    }
  }, [filter, isAdmin]);

  const handleUpdateStatus = async (
    id: string,
    status: "APPROVED" | "REJECTED" | "PENDING"
  ) => {
    try {
      const endpoint =
        status === "APPROVED"
          ? "approve"
          : status === "REJECTED"
            ? "reject"
            : "pending";

      const res = await fetch(
        `/api/admin/leader-applications/${id}/${endpoint}`,
        {
          method: "POST",
        }
      );
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${endpoint} application`);
      }
      setApplications((apps) =>
        apps.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to update application. Please try again.");
    }
  };

  const handleApprove = async (id: string) => {
    await handleUpdateStatus(id, "APPROVED");
  };

  const handleReject = async (id: string) => {
    await handleUpdateStatus(id, "REJECTED");
  };

  const handlePend = async (id: string) => {
    await handleUpdateStatus(id, "PENDING");
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        {isAdmin === null ? (
          <p>Loading...</p>
        ) : isAdmin === false ? (
          <p>Access Denied.</p>
        ) : (
          <>
            <StyledTitle>Leader Applications Management</StyledTitle>
            {error && (
              <div
                style={{
                  background: "mistyrose",
                  border: "1px solid pink",
                  padding: "8px",
                  borderRadius: "4px",
                  marginBottom: "16px",
                }}
              >
                <p style={{ color: "firebrick" }}>{error}</p>
              </div>
            )}
            <StyledFilterContainer>
              {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map(
                (f) => (
                  <StyledFilterButton
                    key={f}
                    active={filter === f}
                    onClick={() => setFilter(f)}
                  >
                    {f}
                  </StyledFilterButton>
                )
              )}
            </StyledFilterContainer>
            {isLoading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p>
                No {filter !== "ALL" ? filter.toLowerCase() : ""} applications
                found.
              </p>
            ) : (
              applications.map((app) => (
                <StyledCard key={app.id}>
                  <StyledCardHeader>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <h3>{app.user.name}</h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "14px",
                          color: "darkslategray",
                        }}
                      >
                        {app.user.imageUrl ? (
                          <img
                            src={app.user.imageUrl}
                            alt="Profile image"
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "50%",
                            }}
                          />
                        ) : null}
                        <span>{app.user.email}</span>
                      </div>
                    </div>
                    <StyledStatusBadge status={app.status}>
                      {formatStatus(app.status)}
                    </StyledStatusBadge>
                  </StyledCardHeader>
                  <hr></hr>

                  <p>Applied on {formatDate(app.createdAt)}</p>
                  <details open={expandedId === app.id}>
                    <summary
                      onClick={(e) => {
                        e.preventDefault();
                        toggleExpand(app.id);
                      }}
                      style={{ cursor: "pointer", color: "royalblue" }}
                    >
                      {expandedId === app.id ? "Hide details" : "View details"}
                    </summary>
                    <div style={{ marginTop: "8px" }}>
                      <p>
                        <strong>Full Name</strong> <br></br>
                        {app.fullName}
                      </p>
                      <p>
                        <strong>Email Address</strong> <br></br>
                        {app.email}
                      </p>
                      <p>
                        <strong>Phone Number</strong> <br></br>
                        {app.phone}
                      </p>
                      <p>
                        <strong>Location (City, Country)</strong> <br></br>
                        {app.location}
                      </p>
                      <p>
                        <strong>
                          Are you currently involved in social justice work?
                        </strong>
                        <br></br>
                        {app.currentlyInvolved ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>
                          Background in social justice, coaching, or community
                          organizing
                        </strong>
                        <br></br>
                        {app.background}
                      </p>
                      <p>
                        <strong>Have you led a community group before?</strong>
                        <br></br>
                        {app.hasLedGroup ? "Yes" : "No"}
                      </p>
                      {app.hasLedGroup && (
                        <p>
                          <strong>Describe your previous role and group</strong>
                          <br></br>
                          {app.previousRole}
                        </p>
                      )}
                      <p>
                        <strong>
                          What topics or issues would your group focus on?
                        </strong>
                        <br></br>
                        {app.focusTopics}
                      </p>
                      <p>
                        <strong>
                          Why do you want to lead a group in this community?
                        </strong>
                        <br></br>
                        {app.motivation}
                      </p>
                      <p>
                        <strong>
                          What leadership style do you bring to community
                          discussions?
                        </strong>
                        <br></br>
                        {app.leadershipStyle}
                      </p>
                      <p>
                        <strong>
                          How would you foster an inclusive and respectful
                          environment?
                        </strong>
                        <br></br>
                        {app.inclusiveEnvironment}
                      </p>
                      <p>
                        <strong>
                          How do you handle conflicts within a group?
                        </strong>
                        <br></br>
                        {app.conflictHandling}
                      </p>
                      <p>
                        <strong>
                          Are you comfortable facilitating difficult discussions
                          on social justice topics?
                        </strong>
                        <br></br>
                        {app.comfortableWithTopics ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>
                          What strategies would you use to keep members engaged?
                        </strong>
                        <br></br>
                        {app.engagementStrategies}
                      </p>
                      <p>
                        <strong>
                          How frequently would you like to hold group
                          discussions?
                        </strong>
                        <br></br>
                        {app.meetingFrequency}
                      </p>
                      <p>
                        <strong>
                          Are you available for a short onboarding session
                          before starting?
                        </strong>
                        <br></br>
                        {app.availableForOnboarding ? "Yes" : "No"}
                      </p>
                      <p>
                        <strong>
                          Are you willing to follow community guidelines and
                          moderation policies?
                        </strong>
                        <br></br>
                        {app.willFollowGuidelines ? "Yes" : "No"}
                      </p>
                      {app.questions && (
                        <p>
                          <strong>
                            Do you have any questions or concerns about leading
                            a group?
                          </strong>{" "}
                          <br></br>
                          {app.questions}
                        </p>
                      )}
                      <p>
                        <strong>Reference Name</strong> <br></br>
                        {app.referenceName}
                      </p>
                      <p>
                        <strong>Reference Contact Information</strong>
                        <br></br>
                        {app.referenceContact}
                      </p>
                      <p>
                        <strong>Relationship to Reference</strong> <br></br>
                        {app.referenceRelationship}
                      </p>
                      {app.videoUrl && (
                        <p>
                          <strong>Video Introduction URL (Optional)</strong>
                          <br />
                          <a
                            href={
                              app.videoUrl.startsWith("http")
                                ? app.videoUrl
                                : `https://${app.videoUrl}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "dodgerblue",
                              textDecoration: "underline",
                            }}
                          >
                            {app.videoUrl}
                          </a>
                        </p>
                      )}
                    </div>
                  </details>
                  {app.status !== null && (
                    <div
                      style={{ marginTop: "12px", display: "flex", gap: "8px" }}
                    >
                      <StyledFilterButton
                        as="button"
                        onClick={() => handleApprove(app.id)}
                        style={{ background: "green", color: "white" }}
                      >
                        Approve
                      </StyledFilterButton>
                      <StyledFilterButton
                        as="button"
                        onClick={() => handleReject(app.id)}
                        style={{ background: "tomato", color: "white" }}
                      >
                        Reject
                      </StyledFilterButton>
                      <StyledFilterButton
                        as="button"
                        onClick={() => handlePend(app.id)}
                        style={{ background: "orange", color: "white" }}
                      >
                        Pending
                      </StyledFilterButton>
                    </div>
                  )}
                </StyledCard>
              ))
            )}
          </>
        )}
      </StyledContainer>
    </StyledMainContent>
  );
}
