"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { parse } from "date-fns";

interface AppointmentType {
  id: string;
  typeName: string;
  description: string | null;
}

export default function ConfirmPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { userId } = useAuth();

  // Retrieve the data passed from the previous page
  const appointmentType = searchParams.get("type") || "one-on-one";
  const date = searchParams.get("date") || "";
  const time = searchParams.get("time") || "";
  const isRecurring = searchParams.get("isRecurring") === "true";
  const recurrencePattern = searchParams.get("recurrencePattern") || "";
  const recurrenceEndDate = searchParams.get("recurrenceEndDate") || "";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [, setLoadingTypes] = useState(true);
  const [appointmentTypes, setAppointmentTypes] = useState<AppointmentType[]>(
    [],
  );

  // Fetch appointment types on component mount
  useEffect(() => {
    const fetchAppointmentTypes = async () => {
      try {
        const response = await fetch("/api/appointments/types");
        if (response.ok) {
          const data = await response.json();
          setAppointmentTypes(data.appointmentTypes || []);
        }
      } catch (error) {
        console.error("Error fetching appointment types:", error);
      } finally {
        setLoadingTypes(false);
      }
    };

    fetchAppointmentTypes();
  }, []);

  // Transform date and time into ISO string format for API
  const getDateTime = (dateStr: string, timeStr: string) => {
    // Handle both 12-hour and 24-hour formats
    if (timeStr.includes("AM") || timeStr.includes("PM")) {
      const [timePart, meridian] = timeStr.split(" ");
      const [hours, minutes] = timePart.split(":");

      const parsedDate = parse(
        `${dateStr} ${hours}:${minutes} ${meridian}`,
        "yyyy-MM-dd h:mm a",
        new Date(),
      );

      return parsedDate.toISOString();
    } else {
      // 24-hour format
      const [hours, minutes] = timeStr.split(":");
      const dateObj = new Date(dateStr);
      dateObj.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
      return dateObj.toISOString();
    }
  };

  const handleSchedule = async () => {
    if (!name || !email) {
      setError("Please fill in your name and email");
      return;
    }

    if (!userId) {
      setError("You must be logged in to schedule an appointment");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Find or create appointment type
      let appointmentTypeId = "";

      // Check if we already have the type
      const foundType = appointmentTypes.find(
        (type) => type.typeName.toLowerCase() === appointmentType.toLowerCase(),
      );

      if (foundType) {
        appointmentTypeId = foundType.id;
      } else {
        // Create a new appointment type
        const createTypeResponse = await fetch("/api/appointments/types", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            typeName: appointmentType,
            description: `${appointmentType} appointment type`,
          }),
        });

        if (!createTypeResponse.ok) {
          throw new Error("Failed to create appointment type");
        }

        const typeData = await createTypeResponse.json();
        appointmentTypeId = typeData.appointmentType.id;
      }

      // Calculate start and end times
      const startTime = getDateTime(date, time);
      const endTimeDate = new Date(startTime);
      endTimeDate.setMinutes(endTimeDate.getMinutes() + 30); // Default to 30 min appointment

      // Create the appointment
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          appointmentTypeId,
          startTime,
          endTime: endTimeDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          locationOrLink: "Virtual", // Default to virtual
          attendees: [
            {
              userId,
              role: "client",
              comments,
            },
          ],
          isRecurring,
          recurrencePattern: isRecurring ? recurrencePattern : null,
          recurrenceEndDate:
            isRecurring && recurrenceEndDate ? recurrenceEndDate : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to schedule appointment");
      }

      const data = await response.json();
      console.log("Appointment scheduled:", data);

      // Show success and redirect
      alert("Your appointment has been scheduled successfully!");
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Error scheduling appointment:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to schedule appointment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Confirm Your Appointment</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
        <div className="mb-6 space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Type:</span>{" "}
            {appointmentType === "one-on-one"
              ? "One-on-One"
              : "Group Consulting"}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Date:</span> {date}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Time:</span> {time}
          </p>

          {isRecurring && (
            <>
              <p className="text-gray-700">
                <span className="font-medium">Recurring:</span> Yes
              </p>
              {recurrencePattern && (
                <p className="text-gray-700">
                  <span className="font-medium">Frequency:</span>{" "}
                  {recurrencePattern.charAt(0).toUpperCase() +
                    recurrencePattern.slice(1)}
                </p>
              )}
              {recurrenceEndDate && (
                <p className="text-gray-700">
                  <span className="font-medium">Until:</span>{" "}
                  {recurrenceEndDate}
                </p>
              )}
            </>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              type="text"
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              Additional Comments
            </label>
            <textarea
              className="border border-gray-300 p-2 rounded w-full"
              placeholder="Any additional details or questions?"
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />
          </div>

          {error && <div className="text-red-500 mt-2">{error}</div>}

          <button
            onClick={handleSchedule}
            className="bg-blue-700 text-white px-6 py-2 rounded-md w-full disabled:bg-blue-400"
            disabled={isSubmitting || !userId}
          >
            {isSubmitting ? "Scheduling..." : "Confirm Appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}
