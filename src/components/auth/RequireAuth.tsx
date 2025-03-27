
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Don't redirect if on auth or public pages
  if (location.pathname === "/auth" || 
      location.pathname === "/" || 
      location.pathname === "/about" || 
      location.pathname === "/features" || 
      location.pathname === "/pricing" || 
      location.pathname === "/careers" || 
      location.pathname === "/invitation") {
    return children;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  if (user && !user.onboardingCompleted && location.pathname !== "/onboarding") {
    console.log("User has not completed onboarding, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
