"use client";

import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useSidebar } from "../../components/SidebarContext";
import LeaderApplicationModal from "./LeaderApplicationModal";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${({ isExpanded }) => (isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: ${({ isExpanded }) => `calc(100% - ${isExpanded ? "256px" : "64px"})`};
`;

const StyledContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
`;

const StyledSection = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const StyledTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const StyledSubtitle = styled.h2`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 16px;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

const StyledButton = styled.button`
  background: #4299e1;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background: #2b6cb0;
  }
`;

const StyledStatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
  font-weight: 500;
  color: white;
  background-color: ${({ status }) => {
    switch (status) {
      case "PENDING":
        return "amber";
      case "APPROVED":
        return "green";
      case "REJECTED":
        return "red";
      default:
        return "gray";
    }
  }};
`;

export default function Settings() {
  const { isExpanded } = useSidebar();
  const { user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [affiliation, setAffiliation] = useState("");
  const [biography, setBiography] = useState("");
  const [leaderApplicationStatus, setLeaderApplicationStatus] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [pendingApplicationsCount, setPendingApplicationsCount] = useState(0);

  const handleSaveProfile = async () => {
    console.log("Saving profile...");
  };

  const refreshLeaderApplication = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/leader-applications/status");
      if (res.ok) {
        const data = await res.json();
        if (data.leaderApplication) {
          setLeaderApplicationStatus(data.leaderApplication.status);
        } else {
          setLeaderApplicationStatus(null);
        }
        if (data.userRole) {
          setUserRole(data.userRole);
        }
      } else {
        setLeaderApplicationStatus(null);
      }
    } catch (error) {
      console.error("Error fetching leader application:", error);
      setLeaderApplicationStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingApplicationsCount = async () => {
    if (userRole !== "admin") return;

    try {
      const res = await fetch("/api/leader-applications/pending-count");
      if (res.ok) {
        const data = await res.json();
        setPendingApplicationsCount(data.count);
      }
    } catch (error) {
      console.error("Error fetching pending applications count:", error);
    }
  };

  useEffect(() => {
    refreshLeaderApplication();
  }, []);

  useEffect(() => {
    if (userRole === "admin") {
      fetchPendingApplicationsCount();
    }
  }, [userRole]);

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Settings</StyledTitle>

        <StyledSection>
          <div className="flex justify-between items-center mb-4">
            <StyledSubtitle>Profile Information</StyledSubtitle>
            {userRole && (
              <div className="text-gray-600 font-medium">
                Role: <span className="font-bold capitalize">{userRole}</span>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Affiliation
            </label>
            <StyledInput
              type="text"
              placeholder="Add your affiliation here..."
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Biography
            </label>
            <StyledTextArea
              placeholder="Add your biography here..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
            />
          </div>

          <StyledButton onClick={handleSaveProfile}>Save Profile</StyledButton>
        </StyledSection>

        {userRole === "admin" && (
          <StyledSection>
            <StyledSubtitle>Admin Tools</StyledSubtitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 font-medium">
                    Leader Applications
                  </p>
                  <p className="text-sm text-gray-600">
                    Review and manage pending leader applications
                  </p>
                </div>
                <Link href="/admin/leader-applications" passHref>
                  <StyledButton className="flex items-center">
                    <span>Review Applications</span>
                    {pendingApplicationsCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-s rounded-full px-2 py-1">
                        {pendingApplicationsCount}
                      </span>
                    )}
                  </StyledButton>
                </Link>
              </div>
            </div>
            <div className="space-y-4" style={{ marginTop: "32px" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 font-medium"> User Interests</p>
                  <p className="text-sm text-gray-600"> View user interests</p>
                </div>
                <Link href="/admin/user-interest" passHref>
                  <StyledButton className="flex items-center">
                    <span>View Interests</span>
                  </StyledButton>
                </Link>
              </div>
            </div>

            <div className="space-y-4" style={{ marginTop: "32px" }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700 font-medium"> Courses Settings</p>
                  <p className="text-sm text-gray-600"> Management of courses, modules, and enrollments</p>
                </div>
                <Link href="/admin/courses" passHref>
                  <StyledButton className="flex items-center">
                    <span>Manage Courses</span>
                  </StyledButton>
                </Link>
              </div>
            </div>
          </StyledSection>
        )}

        <StyledSection>
          <StyledSubtitle>Leadership Application</StyledSubtitle>
          {isLoading ? (
            <p>Loading application status...</p>
          ) : userRole === "leader" || userRole === "admin" ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-700 font-medium">
                You already have leadership privileges in the community.
              </p>
            </div>
          ) : leaderApplicationStatus === null ? (
            <>
              <p className="text-gray-600 mb-4">
                Want to make a bigger impact? Apply to become a community leader
                and help guide meaningful discussions.
              </p>
              <StyledButton
                onClick={() => setIsModalOpen(true)}
                className="bg-green-500 hover:bg-green-600"
              >
                Request to Become a Leader
              </StyledButton>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-lg font-medium">Application Status:</p>
                <StyledStatusBadge status={leaderApplicationStatus}>
                  {formatStatus(leaderApplicationStatus)}
                </StyledStatusBadge>
              </div>
              {leaderApplicationStatus === "REJECTED" && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-700">
                    Sorry, unfortunately your application was not approved. For
                    more information, feel free to contact us.
                  </p>
                </div>
              )}
              {leaderApplicationStatus === "PENDING" && (
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4">
                  <p className="text-amber-700">
                    Your application is currently under review. Check back
                    later.
                  </p>
                </div>
              )}
            </div>
          )}
        </StyledSection>

        <LeaderApplicationModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            refreshLeaderApplication();
          }}
        />
      </StyledContainer>
    </StyledMainContent>
  );
}
