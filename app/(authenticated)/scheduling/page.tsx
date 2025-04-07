"use client";

import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import { useSidebar } from "../../components/SidebarContext";
import { useEffect, useState } from "react";
import { CircularProgress } from "@mui/material";

interface AppointmentType {
  id: string;
  typeName: string;
  description: string | null;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

const StyledMainContent = styled.div<{ isExpanded: boolean }>`
  flex: 1;
  padding: 16px;
  margin-left: ${(props) => (props.isExpanded ? "256px" : "64px")};
  transition: margin-left 0.3s ease-in-out;
  width: calc(100% - ${(props) => (props.isExpanded ? "256px" : "64px")});
`;

const StyledContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 32px;
`;

const StyledTitle = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 24px;
`;

const StyledSubtitle = styled.p`
  font-size: 18px;
  color: #666;
  margin-bottom: 32px;
`;

const StyledCardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 32px;
`;

const StyledCard = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  text-align: center;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    border-color: #4299e1;
  }
`;

const StyledCardTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const StyledCardDescription = styled.p`
  color: #666;
  margin-bottom: 24px;
`;

const StyledIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: #4299e1;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  text-align: center;
  padding: 24px;
  background: #fff5f5;
  border-radius: 8px;
  margin-top: 32px;
`;

export default function AppointmentTypeSelection() {
  const router = useRouter();
  const { isExpanded } = useSidebar();
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        const response = await fetch("/api/appointment-types");
        if (!response.ok) {
          throw new Error("Failed to fetch appointment types");
        }
        const data = await response.json();
        setAppointmentTypes(data);
      } catch (err) {
        setError("Failed to load appointment types. Please try again later.");
        console.error("Error fetching appointment types:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  const handleSelectType = (typeId: string) => {
    router.push(`/scheduling/select-date?type=${typeId}`);
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Schedule an Appointment</StyledTitle>
        <StyledSubtitle>
          Choose the type of appointment you&apos;d like to schedule
        </StyledSubtitle>

        {loading ? (
          <LoadingContainer>
            <CircularProgress />
          </LoadingContainer>
        ) : error ? (
          <ErrorMessage>{error}</ErrorMessage>
        ) : (
          <StyledCardContainer>
            {appointmentTypes.map((type) => (
              <StyledCard
                key={type.id}
                onClick={() => handleSelectType(type.id)}
              >
                <StyledIcon>{type.icon}</StyledIcon>
                <StyledCardTitle>{type.typeName}</StyledCardTitle>
                <StyledCardDescription>
                  {type.description || "No description available"}
                </StyledCardDescription>
              </StyledCard>
            ))}
          </StyledCardContainer>
        )}
      </StyledContainer>
    </StyledMainContent>
  );
}
