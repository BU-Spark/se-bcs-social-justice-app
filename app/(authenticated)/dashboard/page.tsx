"use client";

import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../../components/SidebarContext";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
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

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

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
  const [privateAppointments, setPrivateAppointments] = useState<Appointment[]>(
    [],
  );
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentError, setAppointmentError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        const [publicRes, privateRes] = await Promise.all([
          fetch("/api/appointments/public"),
          fetch("/api/appointments/private"),
        ]);
        if (!publicRes.ok)
          throw new Error("Failed to fetch public appointments");
        if (!privateRes.ok)
          throw new Error("Failed to fetch private appointments");

        const publicData: Appointment[] = await publicRes.json();
        const privateData: Appointment[] = await privateRes.json();

        setPublicAppointments(publicData);
        setPrivateAppointments(privateData);
        setAppointmentError(null);
      } catch (err) {
        setAppointmentError(
          err instanceof Error ? err.message : "An error occurred",
        );
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledHeader>Welcome, {user?.fullName}</StyledHeader>
      <p>Here are your communities and recommendations.</p>
      <br />

      <StyledSection>
        <StyledHeader>Public Events & Seminars</StyledHeader>
        {isLoadingAppointments ? (
          <p>Loading public events...</p>
        ) : appointmentError ? (
          <p style={{ color: "red" }}>{appointmentError}</p>
        ) : publicAppointments.length === 0 ? (
          <p>No public events available at the moment.</p>
        ) : (
          publicAppointments.map((appointment) => {
            const formattedDate = new Date(
              appointment.startTime,
            ).toLocaleDateString("en-US", { month: "long", day: "numeric" });
            const formattedTime = format(
              new Date(appointment.startTime),
              "MMM d, yyyy 'at' h:mm a",
            );
            return (
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
                      When: {formattedDate} at {formattedTime}
                    </div>
                    <div>Attendees: {appointment.attendees.length}</div>
                    <div>
                      Location/Link:{" "}
                      {appointment.locationOrLink ? (
                        isValidUrl(appointment.locationOrLink) ? (
                          <a
                            href={appointment.locationOrLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {appointment.locationOrLink}
                          </a>
                        ) : (
                          appointment.locationOrLink
                        )
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </StyledText>
                <Link href={`/appointments/${appointment.id}`} passHref>
                  <StyledButton>View Details</StyledButton>
                </Link>
              </StyledDiv>
            );
          })
        )}
      </StyledSection>

      <StyledSection>
        <StyledHeader>My Private Consultations</StyledHeader>
        {isLoadingAppointments ? (
          <p>Loading private events...</p>
        ) : appointmentError ? (
          <p style={{ color: "red" }}>{appointmentError}</p>
        ) : privateAppointments.length === 0 ? (
          <p>
            No private consultations currently. Sign up for one in the
            scheduling tab.
          </p>
        ) : (
          privateAppointments.map((appointment) => {
            const formattedDate = new Date(
              appointment.startTime,
            ).toLocaleDateString("en-US", { month: "long", day: "numeric" });
            const formattedTime = format(
              new Date(appointment.startTime),
              "MMM d, yyyy 'at' h:mm a",
            );
            return (
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
                      When: {formattedDate} at {formattedTime}
                    </div>
                    <div>Attendees: {appointment.attendees.length}</div>
                    <div>
                      Location/Link:{" "}
                      {appointment.locationOrLink ? (
                        isValidUrl(appointment.locationOrLink) ? (
                          <a
                            href={appointment.locationOrLink}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {appointment.locationOrLink}
                          </a>
                        ) : (
                          appointment.locationOrLink
                        )
                      ) : (
                        "N/A"
                      )}
                    </div>
                  </div>
                </StyledText>
                <Link href={`/appointments/${appointment.id}`} passHref>
                  <StyledButton>View Details</StyledButton>
                </Link>
              </StyledDiv>
            );
          })
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
