
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  if (user && !user.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
