"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

export default function SelectDatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Retrieve the chosen appointment type from the query string
  const appointmentType = searchParams.get("type") || "one-on-one";

  const [date, setDate] = useState<Date | null>(null);
  const [time, setTime] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrencePattern, setRecurrencePattern] = useState("");
  const [recurrenceEndDate, setRecurrenceEndDate] = useState<Date | null>(null);

  // Recurrence patterns
  const recurrenceOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "biweekly", label: "Bi-weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  const handleConfirm = () => {
    if (!date || !time) return;

    const appointmentDetails = {
      type: appointmentType,
      date: format(date, "yyyy-MM-dd"),
      time,
      isRecurring,
      recurrencePattern: isRecurring ? recurrencePattern : null,
      recurrenceEndDate:
        isRecurring && recurrenceEndDate
          ? format(recurrenceEndDate, "yyyy-MM-dd")
          : null,
    };

    // Pass all the details to the confirmation page
    const queryParams = new URLSearchParams({
      type: appointmentDetails.type,
      date: appointmentDetails.date,
      time: appointmentDetails.time,
      isRecurring: appointmentDetails.isRecurring.toString(),
    });

    if (appointmentDetails.recurrencePattern) {
      queryParams.append(
        "recurrencePattern",
        appointmentDetails.recurrencePattern,
      );
    }

    if (appointmentDetails.recurrenceEndDate) {
      queryParams.append(
        "recurrenceEndDate",
        appointmentDetails.recurrenceEndDate,
      );
    }

    router.push(`/scheduling/confirm?${queryParams.toString()}`);
  };

  return (
    <div className="flex-1 ml-64 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Select a Date &amp; Time</h1>
        <p className="mb-6 text-gray-700">
          Appointment Type:{" "}
          <strong>
            {appointmentType === "one-on-one"
              ? "One-on-One"
              : "Group Consulting"}
          </strong>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Date Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select Date</h2>
            <div className="relative">
              <input
                type="date"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min={format(new Date(), "yyyy-MM-dd")}
                value={date ? format(date, "yyyy-MM-dd") : ""}
                onChange={(e) =>
                  setDate(e.target.value ? new Date(e.target.value) : null)
                }
              />
            </div>
            {date && (
              <p className="mt-2 text-gray-600">
                Selected:{" "}
                <span className="font-medium">
                  {format(date, "MMMM d, yyyy")}
                </span>
              </p>
            )}
          </div>

          {/* Time Selection */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Select Time</h2>
            <div className="relative">
              <input
                type="time"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Recurring appointment section */}
        <div className="mb-8 border-t pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <input
              type="checkbox"
              id="recurring-toggle"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="recurring-toggle" className="text-lg font-medium">
              Make this a recurring appointment
            </label>
          </div>

          {isRecurring && (
            <div className="bg-gray-50 p-4 rounded-md space-y-4 ml-6 border-l-2 border-blue-200 pl-4">
              <div>
                <label className="block mb-2 font-medium">Frequency</label>
                <select
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={recurrencePattern}
                  onChange={(e) => setRecurrencePattern(e.target.value)}
                >
                  <option value="">Select frequency</option>
                  {recurrenceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min={date ? format(date, "yyyy-MM-dd") : undefined}
                  value={
                    recurrenceEndDate
                      ? format(recurrenceEndDate, "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    setRecurrenceEndDate(
                      e.target.value ? new Date(e.target.value) : null,
                    )
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleConfirm}
            className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded-md disabled:bg-gray-400"
            disabled={!date || !time || (isRecurring && !recurrencePattern)}
          >
            Continue to Confirmation
          </button>
        </div>
      </div>
    </div>
  );
}
