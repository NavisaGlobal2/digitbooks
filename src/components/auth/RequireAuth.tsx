
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { ReactNode, useEffect } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Skip auth checks if the URL contains "careers" - this is a public page
  if (location.pathname.includes("/careers")) {
    return <>{children}</>;
  }

  // If not authenticated, redirect to auth page
  if (isAuthenticated === false) {
    console.log("User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  // IMPORTANT: Don't redirect if already on the onboarding page
  if (isAuthenticated && 
      user && 
      user.onboardingCompleted === false && 
      !location.pathname.includes("/onboarding")) {
    console.log("User authenticated but onboarding not completed, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarding completed (or no onboarding status check needed), render the protected route
  return <>{children}</>;
};
