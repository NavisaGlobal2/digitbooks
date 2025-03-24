
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (isAuthenticated && user && !user.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarding completed, render the protected route
  return <>{children}</>;
};
