"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SchedulingPage() {
  const [appointmentType, setAppointmentType] = useState<
    "one-on-one" | "group" | ""
  >("");
  const router = useRouter();

  const handleNext = () => {
    if (!appointmentType) return; // Require a selection
    // Pass the chosen type to the next step as a query param
    router.push(`/scheduling/select-date?type=${appointmentType}`);
  };

  return (
    <div className="ml-64 p-8">
      {/* Offsetting content to the right of the sidebar */}
      <h1 className="text-2xl font-bold mb-4">Schedule an Appointment</h1>
      <p className="mb-6 text-gray-700">Choose an appointment type:</p>

      <div className="flex gap-4">
        <button
          onClick={() => setAppointmentType("one-on-one")}
          className={`flex-1 border p-6 rounded-md 
            ${appointmentType === "one-on-one" ? "border-blue-600" : "border-gray-300"}
          `}
        >
          <h2 className="text-lg font-semibold mb-2">One-on-One Appointment</h2>
          <p>Individual coaching session</p>
        </button>

        <button
          onClick={() => setAppointmentType("group")}
          className={`flex-1 border p-6 rounded-md 
            ${appointmentType === "group" ? "border-blue-600" : "border-gray-300"}
          `}
        >
          <h2 className="text-lg font-semibold mb-2">Group Consulting</h2>
          <p>Session with multiple participants</p>
        </button>
      </div>

      <div className="mt-6">
        <button
          onClick={handleNext}
          className="bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-gray-400"
          disabled={!appointmentType}
        >
          Next
        </button>
      </div>
    </div>
  );
}
