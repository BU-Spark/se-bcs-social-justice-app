"use client";

import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../../components/SidebarContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { CommunitiesData, Community } from "@/types/community";


const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const StyledSection = styled.section`
  margin-bottom: 28px;
`;

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 12px;
  border: 1px solid black;
  border-radius: 8px;
  background-color: white;
  gap: 12px;
`;

const StyledImage = styled.img`
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
`;

const StyledHeader = styled.h2`
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
`;

const StyledText = styled.div`
  flex: 1;
`;

const StyledButton = styled.button`
  padding: 12px 22px;
  background-color: blue;
  color: white;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  &:hover {
    background-color: red;
  }
`;


// Interface for appointment data
interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  locationOrLink?: string;
  appointmentType: {
    id: string;
    title: string;
    description?: string;
    icon: string;
  };
  host: {
    id: string;
    name: string;
    email: string;
    imageUrl?: string;
  };
  attendees: Array<{
    id: string;
    email: string;
  }>;
}

export default function DashboardPage() {
  const { user } = useUser();
  const { isExpanded } = useSidebar();
  const [data, setData] = useState<CommunitiesData>({
    joinedCommunities: [],
    recommendedCommunities: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchCommunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/communities");
      if (!res.ok) throw new Error("Failed to fetch communities");
      const json: CommunitiesData = await res.json();
      setData(json);
    } catch (e) {
      console.error("Error fetching communities:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const res = await fetch("/api/join-community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ communityId }),
      });
      if (!res.ok) throw new Error("Failed to join community");
      fetchCommunities();
    } catch (error) {
      console.error("Error joining community:", error);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);
  const [publicAppointments, setPublicAppointments] = useState<Appointment[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPublicAppointments = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/appointments/public");
        if (!response.ok) {
          throw new Error("Failed to fetch public appointments");
        }
        const data = await response.json();
        setPublicAppointments(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPublicAppointments();
  }, []);

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader>Welcome, {user?.fullName}</StyledHeader>
      <p>Here are your communities and recommendations.</p>
      <br />

      <StyledSection>
        <StyledHeader>Public Events & Seminars</StyledHeader>
        {isLoading ? (
          <p>Loading events...</p>
        ) : error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : publicAppointments.length === 0 ? (
          <p>No public events available at the moment.</p>
        ) : (
          publicAppointments.map((appointment) => (
            <StyledDiv key={appointment.id}>
              {appointment.host.imageUrl ? (
                <StyledImage
                  src={appointment.host.imageUrl}
                  alt={`${appointment.appointmentType.title} event`}
                />
              ) : (
                <div
                  style={{
                    width: 100,
                    height: 100,
                    backgroundColor: "#e2e8f0",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "24px",
                  }}
                >
                  {appointment.appointmentType.icon}
                </div>
              )}
              <StyledText>
                <strong>{appointment.appointmentType.title}</strong>
                <p>{appointment.appointmentType.description}</p>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#718096",
                    marginTop: "4px",
                  }}
                >
                  <div>Host: {appointment.host.name}</div>
                  <div>
                    When:{" "}
                    {format(
                      new Date(appointment.startTime),
                      "MMM d, yyyy 'at' h:mm a",
                    )}
                  </div>
                  <div>Attendees: {appointment.attendees.length}</div>
                </div>
              </StyledText>
              <Link href={`/appointments/${appointment.id}`} passHref>
                <StyledButton>View Details</StyledButton>
              </Link>
            </StyledDiv>
          ))
        )}
      </StyledSection>

      <StyledSection>
        <StyledHeader>My Communities</StyledHeader>
        {loading ? (
          <p>Loading...</p>
        ) : data.joinedCommunities.length === 0 ? (
          <p>You are not in any communities currently!</p>
        ) : (
          data.joinedCommunities.map((community: Community) => (
            <StyledDiv key={community.id}>
              <StyledImage
                src={community.imageUrl || "/default-image.jpg"}
                alt={community.name}
              />
              <StyledText>
                <strong>{community.name}</strong>
                <p>{community.description}</p>
              </StyledText>
              <Link href={`/communities/${community.id}`} passHref>
                <StyledButton>View</StyledButton>
              </Link>
            </StyledDiv>
          ))
        )}
      </StyledSection>
      <StyledSection>
        <StyledHeader>Recommended Communities</StyledHeader>
        {loading ? (
          <p>Loading...</p>
        ) : data.recommendedCommunities.length === 0 ? (
          <p>There are no groups available currently!</p>
        ) : (
          data.recommendedCommunities.map((group: Community) => (
            <StyledDiv key={group.id}>
              <StyledImage
                src={group.imageUrl || "/default-image.jpg"}
                alt={group.name}
              />
              <StyledText>
                <strong>{group.name}</strong>
                <p>{group.description}</p>
              </StyledText>
              <StyledButton onClick={() => handleJoinCommunity(group.id)}>
                Join Community
              </StyledButton>
            </StyledDiv>
          ))
        )}
      </StyledSection>
    </StyledMainContent>
  );
}
