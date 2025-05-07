"use client";
import { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { useUser } from "@clerk/nextjs";
import { useSidebar } from "../../components/SidebarContext";
import Link from "next/link";
import { format } from "date-fns";
import { Event, School, Groups } from "@mui/icons-material";

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

const StyledHeader = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const StyledCard = styled.div`
  display: flex;
  align-items: flex-start;
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  transition:
    transform 0.2s,
    box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 12px;
  background-color: #e5e7eb;
  color: #4b5563;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20px;
  flex-shrink: 0;
`;

const EventDetails = styled.div`
  flex: 1;
`;

const EventTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1f2937;
`;

const EventDescription = styled.p`
  font-size: 16px;
  color: #4b5563;
  margin-bottom: 12px;
`;

const EventMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StyledButton = styled.button`
  padding: 10px 18px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-left: 20px;
  align-self: center;

  &:hover {
    background-color: #4338ca;
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

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "Event":
      return <Event style={{ fontSize: 32 }} />;
    case "School":
      return <School style={{ fontSize: 32 }} />;
    case "Groups":
      return <Groups style={{ fontSize: 32 }} />;
    default:
      return <Event style={{ fontSize: 32 }} />;
  }
};

export default function EventsPage() {
  useUser();
  const { isExpanded } = useSidebar();
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
          throw new Error("Failed to fetch public events");
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
      <StyledHeader>Community Events</StyledHeader>
      <p className="text-gray-600 mb-6">
        Join these upcoming events and connect with your community
      </p>

      <StyledSection>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : publicAppointments.length === 0 ? (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-8 rounded text-center">
            <p className="text-lg font-medium mb-2">No events available</p>
            <p>Check back later for upcoming community events.</p>
          </div>
        ) : (
          publicAppointments.map((event) => (
            <StyledCard key={event.id}>
              <IconWrapper>
                {getIconComponent(event.appointmentType.icon)}
              </IconWrapper>
              <EventDetails>
                <EventTitle>{event.appointmentType.title}</EventTitle>
                <EventDescription>
                  {event.appointmentType.description}
                </EventDescription>
                <EventMeta>
                  <MetaItem>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {format(new Date(event.startTime), "MMMM d, yyyy")}
                  </MetaItem>
                  <MetaItem>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {format(new Date(event.startTime), "h:mm a")}
                  </MetaItem>
                  <MetaItem>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    Host: {event.host.name}
                  </MetaItem>
                  <MetaItem>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    {event.attendees.length} attendees
                  </MetaItem>
                </EventMeta>
              </EventDetails>
              <Link href={`/appointments/${event.id}`} passHref>
                <StyledButton>Join Event</StyledButton>
              </Link>
            </StyledCard>
          ))
        )}
      </StyledSection>
    </StyledMainContent>
  );
}
