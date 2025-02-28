"use client";

import { useSearchParams } from "next/navigation";
import Sidebar from "./components/Sidebar";
import Onboarding from "./components/Onboarding";

const HomePage = () => {
  const searchParams = useSearchParams();
  const fromSignup = searchParams.get("from") === "signup";

  return (
    <div className="flex items-center justify-around p-5">
      <div>
        {fromSignup && <Onboarding />}
        <Sidebar />
        <h1 className="text-2xl font-bold">
          Welcome to the Social Justice Platform
        </h1>
      </div>
    </div>
  );
};

export default HomePage;
