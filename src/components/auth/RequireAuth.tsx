
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface RequireAuthProps {
  children: JSX.Element;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log("RequireAuth check:", { path: location.pathname, isAuthenticated, user });

  // List of public routes that don't require authentication
  const publicRoutes = ["/auth", "/", "/about", "/features", "/pricing", "/careers", "/invitation"];
  
  // If on a public page, don't redirect
  if (publicRoutes.includes(location.pathname)) {
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
