"use client";
import styled from "@emotion/styled";
import { useRouter, useSearchParams } from "next/navigation";
import { useSidebar } from "../../../components/SidebarContext";
import { useState, useEffect } from "react";
import { format } from "date-fns";

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

const StyledCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const StyledDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    border-bottom: none;
  }
`;

const StyledLabel = styled.span`
  color: #666;
`;

const StyledValue = styled.span`
  font-weight: 500;
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

  &:disabled {
    background: #cbd5e0;
    cursor: not-allowed;
  }
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  margin-top: 16px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #4299e1;
  }
`;

interface Attendee {
  name: string;
  email: string;
}

interface AppointmentType {
  id: string;
  typeName: string;
  description: string | null;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export default function ConfirmAppointment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isExpanded } = useSidebar();
  const [additionalComments, setAdditionalComments] = useState("");
  const [appointmentType, setAppointmentType] =
    useState<AppointmentType | null>(null);

  const appointmentTypeId = searchParams.get("type");
  const date = searchParams.get("date");
  const isRecurring = searchParams.get("isRecurring") === "true";
  const recurrencePattern = searchParams.get("recurrencePattern");
  const attendeesParam = searchParams.get("attendees");
  const attendees: Attendee[] = attendeesParam
    ? JSON.parse(attendeesParam)
    : [];

  useEffect(() => {
    const fetchAppointmentType = async () => {
      if (appointmentTypeId) {
        try {
          const response = await fetch(
            `/api/appointment-types/${appointmentTypeId}`,
          );
          if (response.ok) {
            const data = await response.json();
            setAppointmentType(data);
          }
        } catch (error) {
          console.error("Failed to fetch appointment type:", error);
        }
      }
    };

    fetchAppointmentType();
  }, [appointmentTypeId]);

  const handleConfirm = async () => {
    try {
      if (!appointmentTypeId || !date) {
        throw new Error("Missing required appointment details");
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentTypeId,
          date: new Date(date).toISOString(),
          isRecurring,
          recurrencePattern,
          additionalComments,
          attendees,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      // Redirect to success page or dashboard
      router.push("/");
    } catch (error) {
      console.error("Failed to create appointment:", error);
      // TODO: Add error handling UI
    }
  };

  if (!date) {
    return (
      <StyledMainContent isExpanded={isExpanded}>
        <StyledContainer>
          <StyledTitle>Invalid Appointment</StyledTitle>
          <StyledSubtitle>
            The appointment details are incomplete. Please start over.
          </StyledSubtitle>
          <StyledButton onClick={() => router.push("/scheduling")}>
            Start Over
          </StyledButton>
        </StyledContainer>
      </StyledMainContent>
    );
  }

  const appointmentDate = new Date(date);

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Confirm Appointment</StyledTitle>
        <StyledSubtitle>
          Please review your appointment details before confirming
        </StyledSubtitle>

        <StyledCard>
          <StyledDetailRow>
            <StyledLabel>Appointment Type</StyledLabel>
            <StyledValue>
              {appointmentType ? appointmentType.typeName : "Loading..."}
            </StyledValue>
          </StyledDetailRow>

          <StyledDetailRow>
            <StyledLabel>Date</StyledLabel>
            <StyledValue>{format(appointmentDate, "MMMM d, yyyy")}</StyledValue>
          </StyledDetailRow>

          <StyledDetailRow>
            <StyledLabel>Time</StyledLabel>
            <StyledValue>{format(appointmentDate, "h:mm a")}</StyledValue>
          </StyledDetailRow>

          {isRecurring && (
            <StyledDetailRow>
              <StyledLabel>Recurrence</StyledLabel>
              <StyledValue>
                {recurrencePattern
                  ? recurrencePattern.charAt(0).toUpperCase() +
                    recurrencePattern.slice(1)
                  : "Not specified"}
              </StyledValue>
            </StyledDetailRow>
          )}
        </StyledCard>

        <StyledCard>
          <h2 className="text-xl font-semibold mb-4">Attendees</h2>
          {attendees.map((attendee, index) => (
            <StyledDetailRow key={index}>
              <div>
                <StyledLabel>Attendee {index + 1}</StyledLabel>
                <StyledValue className="block">
                  {attendee.name} ({attendee.email})
                </StyledValue>
              </div>
            </StyledDetailRow>
          ))}
        </StyledCard>

        <StyledCard>
          <h2 className="text-xl font-semibold mb-4">Additional Comments</h2>
          <StyledTextArea
            placeholder="Add any additional information or requirements for your appointment..."
            value={additionalComments}
            onChange={(e) => setAdditionalComments(e.target.value)}
          />
        </StyledCard>

        <div className="flex justify-end space-x-4">
          <StyledButton
            onClick={() => router.back()}
            style={{ background: "#e2e8f0", color: "#4a5568" }}
          >
            Back
          </StyledButton>
          <StyledButton onClick={handleConfirm}>
            Confirm Appointment
          </StyledButton>
        </div>
      </StyledContainer>
    </StyledMainContent>
  );
}
