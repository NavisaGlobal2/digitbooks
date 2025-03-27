import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If user is trying to access the auth page and they're already authenticated,
  // redirect them appropriately
  if (isAuthenticated && location.pathname === "/auth") {
    // If they haven't completed onboarding, send to onboarding
    if (user && !user.onboardingCompleted) {
      return <Navigate to="/onboarding" replace />;
    }
    // Otherwise send to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, redirect to login except for auth page
  if (!isAuthenticated) {
    // Don't redirect if they're already on the auth page
    if (location.pathname === "/auth") {
      return children;
    }
    // Otherwise redirect to auth
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  if (user && !user.onboardingCompleted && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
