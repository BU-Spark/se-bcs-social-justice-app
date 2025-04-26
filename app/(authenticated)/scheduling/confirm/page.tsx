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
  email: string;
  name?: string;
}

interface AppointmentType {
  id: string;
  title: string;
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const appointmentTypeId = searchParams.get("type");
  const date = searchParams.get("date");
  const isRecurring = searchParams.get("isRecurring") === "true";
  const recurrencePattern = searchParams.get("recurrencePattern");
  const recurrenceData = searchParams.get("recurrenceData");
  const recurrenceDetails = recurrenceData ? JSON.parse(recurrenceData) : null;
  const weeklyDays = recurrenceDetails?.weekly_days || [];
  const recurrenceEndType = recurrenceDetails?.end_times
    ? "occurrences"
    : "date";
  const recurrenceEndDate = recurrenceDetails?.end_date_time
    ? new Date(recurrenceDetails.end_date_time)
    : null;
  const recurrenceOccurrences = recurrenceDetails?.end_times || 1;
  const attendeesParam = searchParams.get("attendees");
  const attendees: Attendee[] = attendeesParam
    ? JSON.parse(attendeesParam)
    : [];

  // Load saved form data when component mounts
  useEffect(() => {
    const savedFormData = localStorage.getItem("confirmFormData");
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData);
        const {
          additionalComments: savedComments,
          appointmentType: savedAppointmentType,
        } = parsedData;

        setAdditionalComments(savedComments || "");
        if (savedAppointmentType) {
          setAppointmentType(savedAppointmentType);
        }

        // No need to redirect, just use the URL params
      } catch (error) {
        console.error("Error parsing saved form data:", error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAppointmentType = async () => {
      if (!appointmentTypeId) return;

      try {
        const response = await fetch(
          `/api/appointment-types/${appointmentTypeId}`,
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAppointmentType(data);

        // Save to localStorage after successful fetch
        const formData = {
          type: appointmentTypeId,
          date,
          isRecurring,
          recurrencePattern,
          recurrenceData,
          attendees,
          additionalComments,
          appointmentType: data,
          weeklyDays,
          recurrenceEndType,
          recurrenceEndDate: recurrenceEndDate?.toISOString(),
          recurrenceOccurrences,
        };
        localStorage.setItem("confirmFormData", JSON.stringify(formData));
      } catch (error) {
        console.error("Failed to fetch appointment type:", error);
        // Try to get from localStorage as fallback
        const savedFormData = localStorage.getItem("confirmFormData");
        if (savedFormData) {
          try {
            const { appointmentType: savedAppointmentType } =
              JSON.parse(savedFormData);
            if (savedAppointmentType) {
              setAppointmentType(savedAppointmentType);
            }
          } catch (parseError) {
            console.error("Error parsing saved appointment type:", parseError);
          }
        }
      }
    };

    // Only fetch if we don't have the appointment type
    if (!appointmentType) {
      fetchAppointmentType();
    }
  }, [
    appointmentTypeId,
    appointmentType,
    date,
    isRecurring,
    recurrencePattern,
    recurrenceData,
    attendees,
    additionalComments,
    weeklyDays,
    recurrenceEndType,
    recurrenceEndDate,
    recurrenceOccurrences,
  ]);

  // Save form data whenever any fields change
  useEffect(() => {
    if (appointmentType) {
      const formData = {
        type: appointmentTypeId,
        date,
        isRecurring,
        recurrencePattern,
        recurrenceData,
        attendees,
        additionalComments,
        appointmentType,
        weeklyDays,
        recurrenceEndType,
        recurrenceEndDate: recurrenceEndDate?.toISOString(),
        recurrenceOccurrences,
      };
      localStorage.setItem("confirmFormData", JSON.stringify(formData));
    }
  }, [
    appointmentTypeId,
    date,
    isRecurring,
    recurrencePattern,
    recurrenceData,
    attendees,
    additionalComments,
    appointmentType,
    weeklyDays,
    recurrenceEndType,
    recurrenceEndDate,
    recurrenceOccurrences,
  ]);

  const handleBack = () => {
    // Save the current form data before going back
    const formData = {
      type: appointmentTypeId,
      date,
      isRecurring,
      recurrencePattern,
      recurrenceData,
      attendees,
      additionalComments,
      appointmentType,
      weeklyDays,
      recurrenceEndType,
      recurrenceEndDate: recurrenceEndDate?.toISOString(),
      recurrenceOccurrences,
    };
    localStorage.setItem("confirmFormData", JSON.stringify(formData));

    // Don't clear localStorage when going back
    router.back();
  };

  const handleConfirm = async () => {
    try {
      if (!appointmentTypeId || !date) {
        setErrorMessage("Missing required appointment details");
        return;
      }

      setIsSubmitting(true);
      setErrorMessage(null);

      const appointmentDate = new Date(date);

      // Validate recurrence data to prevent too many recurring appointments
      let validatedRecurrenceData = null;
      if (isRecurring && recurrencePattern && recurrenceData) {
        try {
          const parsedData =
            typeof recurrenceData === "string"
              ? JSON.parse(recurrenceData)
              : recurrenceData;

          // Ensure we have valid end conditions for recurring appointments
          if (!parsedData.end_times && !parsedData.end_date_time) {
            // Set a reasonable default if neither is specified
            parsedData.end_times = 1; // Default to just one recurrence
          }

          // Cap the number of recurrences to a reasonable limit
          if (parsedData.end_times && parsedData.end_times > 10) {
            parsedData.end_times = 10;
          }

          // Ensure end date is not too far in the future (max 6 months)
          if (parsedData.end_date_time) {
            const maxEndDate = new Date();
            maxEndDate.setMonth(maxEndDate.getMonth() + 6);

            const endDate = new Date(parsedData.end_date_time);
            if (endDate > maxEndDate) {
              parsedData.end_date_time = maxEndDate.toISOString();
            }
          }

          validatedRecurrenceData = parsedData;
          console.log("Validated recurrence data:", validatedRecurrenceData);
        } catch (e) {
          console.error("Error validating recurrence data:", e);
          // Default to a single recurrence if there's an error parsing
          validatedRecurrenceData = { end_times: 1 };
        }
      }

      // Prepare the request data
      const requestData = {
        appointmentTypeId,
        date: appointmentDate.toISOString(),
        isRecurring,
        recurrencePattern,
        recurrenceData: validatedRecurrenceData, // Use validated data
        additionalComments,
        attendees,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create appointment");
      }

      // Set success message
      setSuccessMessage("Appointment created successfully!");

      // Clear all form data from localStorage when confirming
      localStorage.removeItem("schedulingFormData");
      localStorage.removeItem("confirmFormData");

      // Wait for 1.5 seconds before redirecting to allow user to see success message
      setTimeout(() => {
        // Redirect to success page or dashboard
        router.push("/");
      }, 1500);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to create appointment",
      );
    } finally {
      setIsSubmitting(false);
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

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Confirm Appointment</StyledTitle>
        <StyledSubtitle>
          Please review your appointment details before confirming
        </StyledSubtitle>

        {errorMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <strong>Success:</strong> {successMessage}
          </div>
        )}

        <StyledCard>
          <StyledDetailRow>
            <StyledLabel>Appointment Type</StyledLabel>
            <StyledValue>
              {appointmentType ? appointmentType.title : "Loading..."}
            </StyledValue>
          </StyledDetailRow>

          <StyledDetailRow>
            <StyledLabel>Date</StyledLabel>
            <StyledValue>{format(new Date(date), "MMMM d, yyyy")}</StyledValue>
          </StyledDetailRow>

          <StyledDetailRow>
            <StyledLabel>Time</StyledLabel>
            <StyledValue>{format(new Date(date), "h:mm a")}</StyledValue>
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
                  {attendee.name
                    ? `${attendee.name} (${attendee.email})`
                    : attendee.email}
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
            onChange={(e) => {
              const newValue = e.target.value;
              setAdditionalComments(newValue);

              // Save the updated comment to localStorage
              const formData = {
                type: appointmentTypeId,
                date,
                isRecurring,
                recurrencePattern,
                recurrenceData,
                attendees,
                additionalComments: newValue,
                appointmentType,
                weeklyDays,
                recurrenceEndType,
                recurrenceEndDate: recurrenceEndDate?.toISOString(),
                recurrenceOccurrences,
              };
              localStorage.setItem("confirmFormData", JSON.stringify(formData));
            }}
          />
        </StyledCard>

        <div className="flex justify-end space-x-4">
          <StyledButton
            onClick={handleBack}
            style={{ background: "#e2e8f0", color: "#4a5568" }}
            disabled={isSubmitting}
          >
            Back
          </StyledButton>
          <StyledButton onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Creating Appointment..." : "Confirm Appointment"}
          </StyledButton>
        </div>
      </StyledContainer>
    </StyledMainContent>
  );
}
