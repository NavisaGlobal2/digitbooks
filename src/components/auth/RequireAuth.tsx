
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log("RequireAuth check - isAuthenticated:", isAuthenticated);
  console.log("RequireAuth check - user:", user);
  console.log("RequireAuth check - current location:", location.pathname);

  if (!isAuthenticated) {
    // If not authenticated, redirect to login
    console.log("User not authenticated, redirecting to login");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  if (user && !user.onboardingCompleted && location.pathname !== "/onboarding") {
    console.log("User has not completed onboarding, redirecting to onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};
