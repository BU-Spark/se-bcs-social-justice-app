"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import Onboarding from "./Onboarding";

export default function OnboardingWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser();
  const [localUser, setLocalUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLocalUser() {
      if (!isLoaded || !user) return;
      
      try {
        const response = await fetch("/api/local-user");
        if (response.ok) {
          const data = await response.json();
          setLocalUser(data);
        }
      } catch (error) {
        console.error("Error fetching local user:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLocalUser();

    // Optional: Periodically check user status (every 5 minutes)
    // This ensures if an admin changes onboardingComplete, user will see it
    const interval = setInterval(() => {
      fetchLocalUser();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, isLoaded]);

  // Show loading state while checking
  if (!isLoaded || isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show onboarding if user hasn't completed it
  if (localUser && !localUser.onboardingComplete) {
    return <Onboarding />;
  }

  return <>{children}</>;
}