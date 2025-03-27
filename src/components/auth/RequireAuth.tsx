
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { ReactNode, useEffect, isValidElement } from "react";

interface RequireAuthProps {
  children: ReactNode;
}

export const RequireAuth = ({ children }: RequireAuthProps) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Enhanced debug logging to identify issues
  useEffect(() => {
    const componentName = isValidElement(children) 
      ? (children.type as any)?.name || 'Component' 
      : 'Unknown Component';
    
    console.log("RequireAuth - Auth state:", { 
      isAuthenticated, 
      user, 
      onboardingCompleted: user?.onboardingCompleted,
      currentPath: location.pathname,
      component: componentName
    });
  }, [isAuthenticated, user, location, children]);

  // If not authenticated, redirect to auth page
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to /auth");
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user has completed onboarding
  // If user is authenticated but hasn't completed onboarding, redirect to onboarding
  if (isAuthenticated && user && user.onboardingCompleted === false && location.pathname !== "/onboarding") {
    console.log("User authenticated but onboarding not completed, redirecting to /onboarding");
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and onboarding completed, render the protected route
  const componentName = isValidElement(children) 
    ? (children.type as any)?.name || 'Component' 
    : 'Unknown Component';
  console.log("User authenticated and authorized, rendering protected route:", componentName);
  return <>{children}</>;
};
