"use client";

import { useSearchParams } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Onboarding from "./components/Onboarding";
import { useUser } from "@clerk/nextjs";

const HomePage = () => {
  const searchParams = useSearchParams();
  const fromSignup = searchParams.get("from") === "signup";
  const { user } = useUser();

  return (
    <div className="flex items-center justify-around p-5">
      <div>
        {fromSignup && <Onboarding />}
        <Sidebar />
        <h1 className="text-2xl font-bold">
          Welcome to the Social Justice Platform
        </h1>
        <p>Signed in as {user?.fullName}</p>
      </div>
    </div>
  );
};

export default HomePage;
