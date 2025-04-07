"use client";
import styled from "@emotion/styled";
import { useRouter, useSearchParams } from "next/navigation";
import { useSidebar } from "../../../components/SidebarContext";
import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import dayjs from "dayjs";
import { TextField, Button } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4299e1",
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#4299e1",
          },
        },
        input: {
          padding: "10px 14px",
        },
      },
    },
  },
});

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

const StyledCalendarContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;

  .react-calendar {
    width: 100%;
    border: none;
    font-family: inherit;
  }

  .react-calendar__navigation {
    margin-bottom: 1em;
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    font-size: 16px;
    margin-top: 8px;
  }

  .react-calendar__navigation button:enabled:hover,
  .react-calendar__navigation button:enabled:focus {
    background-color: #f0f9ff;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: bold;
    font-size: 0.75em;
    color: #4299e1;
  }

  .react-calendar__month-view__weekdays__weekday {
    padding: 0.5em;
  }

  .react-calendar__month-view__weekdays__weekday abbr {
    text-decoration: none;
  }

  .react-calendar__tile {
    max-width: 100%;
    padding: 10px 6.6667px;
    background: none;
    text-align: center;
    line-height: 16px;
    font-size: 14px;
  }

  .react-calendar__tile:enabled:hover,
  .react-calendar__tile:enabled:focus {
    background-color: #f0f9ff;
    color: #4299e1;
    border-radius: 6px;
  }

  .react-calendar__tile--now {
    background: #ebf8ff;
    border-radius: 6px;
  }

  .react-calendar__tile--now:enabled:hover,
  .react-calendar__tile--now:enabled:focus {
    background: #4299e1;
    color: white;
  }

  .react-calendar__tile--hasActive {
    background: #4299e1;
    color: white;
    border-radius: 6px;
  }

  .react-calendar__tile--hasActive:enabled:hover,
  .react-calendar__tile--hasActive:enabled:focus {
    background: #2b6cb0;
  }

  .react-calendar__tile--active {
    background: #4299e1;
    color: white;
    border-radius: 6px;
  }

  .react-calendar__tile--active:enabled:hover,
  .react-calendar__tile--active:enabled:focus {
    background: #2b6cb0;
  }
`;

const StyledTimeContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
  position: relative;

  .MuiTextField-root {
    width: 100%;
    max-width: 200px;
  }

  .MuiOutlinedInput-root {
    background-color: white;
  }
`;

const StyledRecurringContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const StyledCheckbox = styled.input`
  margin-right: 8px;
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

const StyledAttendeesContainer = styled.div`
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 32px;
`;

const StyledAttendeeForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;

  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }

  .attendee-fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .remove-button {
    align-self: flex-end;
    color: #ef4444;
    &:hover {
      color: #dc2626;
    }
  }
`;

interface Attendee {
  name: string;
  email: string;
  touched: boolean;
}

export default function SelectDateTime() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isExpanded } = useSidebar();
  const appointmentType = searchParams.get("type");

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState(dayjs());
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState<
    "daily" | "weekly" | "biweekly" | "monthly" | null
  >(null);
  const [attendees, setAttendees] = useState<Attendee[]>([
    { name: "", email: "", touched: false },
  ]);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleAttendeeChange = (
    index: number,
    field: keyof Attendee,
    value: string,
  ) => {
    const newAttendees = [...attendees];
    newAttendees[index] = {
      ...newAttendees[index],
      [field]: value,
      touched: true,
    };
    setAttendees(newAttendees);
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", email: "", touched: false }]);
  };

  const removeAttendee = (index: number) => {
    if (attendees.length > 1) {
      const newAttendees = attendees.filter((_, i) => i !== index);
      setAttendees(newAttendees);
    }
  };

  const handleNext = () => {
    setFormSubmitted(true);

    if (!isFormValid()) {
      return;
    }

    if (!selectedDate || !selectedTime) return;

    const date = new Date(selectedDate);
    date.setHours(selectedTime.hour());
    date.setMinutes(selectedTime.minute());

    const attendeesData = attendees.map(({ name, email }) => ({ name, email }));

    const params = new URLSearchParams({
      type: appointmentType || "",
      date: date.toISOString(),
      isRecurring: isRecurring.toString(),
      ...(isRecurring && recurrencePattern ? { recurrencePattern } : {}),
      attendees: JSON.stringify(attendeesData),
    });

    router.push(`/scheduling/confirm?${params.toString()}`);
  };

  const isFormValid = () => {
    return (
      selectedDate &&
      selectedTime &&
      (!isRecurring || recurrencePattern) &&
      attendees.every(
        (attendee) =>
          attendee.name.trim() !== "" &&
          attendee.email.trim() !== "" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email),
      )
    );
  };

  const shouldShowError = (attendee: Attendee, field: "name" | "email") => {
    if (!formSubmitted && !attendee.touched) return false;

    if (field === "name") {
      return attendee.name.trim() === "";
    }

    if (field === "email") {
      return (
        attendee.email.trim() === "" ||
        (attendee.email.trim() !== "" &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(attendee.email))
      );
    }

    return false;
  };

  return (
    <StyledMainContent isExpanded={isExpanded}>
      <StyledContainer>
        <StyledTitle>Select Date and Time</StyledTitle>
        <StyledSubtitle>
          Choose when you&apos;d like to schedule your{" "}
          {appointmentType === "one-on-one" ? "one-on-one" : "group"}{" "}
          consultation
        </StyledSubtitle>

        <StyledCalendarContainer>
          <Calendar
            onChange={(value) => setSelectedDate(value as Date)}
            value={selectedDate}
            minDate={new Date()}
            calendarType="gregory"
            tileClassName={({ date }) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today ? "react-calendar__tile--disabled" : "";
            }}
          />
        </StyledCalendarContainer>

        <StyledTimeContainer>
          <h2 className="text-xl font-semibold mb-4">Select Time</h2>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
              <TimePicker
                value={selectedTime}
                onChange={(newValue) => {
                  if (newValue) {
                    setSelectedTime(newValue);
                  }
                }}
                disabled={!selectedDate}
                format="hh:mm a"
                ampm
                slotProps={{
                  textField: {
                    variant: "outlined",
                    placeholder: "Select time",
                  },
                }}
              />
            </ThemeProvider>
          </LocalizationProvider>
        </StyledTimeContainer>

        <StyledAttendeesContainer>
          <h2 className="text-xl font-semibold mb-4">Attendees</h2>
          {attendees.map((attendee, index) => (
            <StyledAttendeeForm key={index}>
              <div className="attendee-fields">
                <TextField
                  label="Name"
                  value={attendee.name}
                  onChange={(e) =>
                    handleAttendeeChange(index, "name", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  required
                  error={shouldShowError(attendee, "name")}
                  helperText={
                    shouldShowError(attendee, "name") ? "Name is required" : ""
                  }
                />
                <TextField
                  label="Email"
                  type="email"
                  value={attendee.email}
                  onChange={(e) =>
                    handleAttendeeChange(index, "email", e.target.value)
                  }
                  variant="outlined"
                  fullWidth
                  required
                  error={shouldShowError(attendee, "email")}
                  helperText={
                    shouldShowError(attendee, "email")
                      ? attendee.email.trim() === ""
                        ? "Email is required"
                        : "Invalid email format"
                      : ""
                  }
                />
              </div>
              {attendees.length > 1 && (
                <Button
                  onClick={() => removeAttendee(index)}
                  variant="text"
                  color="error"
                  className="remove-button"
                >
                  Remove Attendee
                </Button>
              )}
            </StyledAttendeeForm>
          ))}
          <Button
            onClick={addAttendee}
            variant="outlined"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Add Another Attendee
          </Button>
        </StyledAttendeesContainer>

        <StyledRecurringContainer>
          <div className="flex items-center mb-4">
            <StyledCheckbox
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
            />
            <label htmlFor="recurring" className="font-medium">
              Make this a recurring appointment
            </label>
          </div>

          {isRecurring && (
            <div className="space-y-2">
              <label className="block font-medium">Recurrence Pattern</label>
              <select
                className="w-full p-2 border rounded"
                value={recurrencePattern || ""}
                onChange={(e) =>
                  setRecurrencePattern(
                    e.target.value as
                      | "daily"
                      | "weekly"
                      | "biweekly"
                      | "monthly",
                  )
                }
              >
                <option value="">Select pattern</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="biweekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}
        </StyledRecurringContainer>

        <StyledButton onClick={handleNext} disabled={!isFormValid()}>
          Next
        </StyledButton>
      </StyledContainer>
    </StyledMainContent>
  );
}
