import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import FeatureDisplay from "@/components/auth/FeatureDisplay";
import AuthHeader from "@/components/auth/AuthHeader";
import DecorativeBackground from "@/components/auth/DecorativeBackground";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login mode
  const [authError, setAuthError] = useState<string | null>(null);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log("Auth page loaded");
    console.log("Current URL:", window.location.href);
    console.log("Origin:", window.location.origin);
    console.log("Search params:", location.search);
    console.log("Hash:", location.hash);
    
    // Additional debug info for Google auth
    if (navigator.userAgent) {
      console.log("User agent:", navigator.userAgent);
    }
    
    // Test if we can access Google domains (for CORS diagnostics)
    fetch('https://accounts.google.com/gsi/status', { 
      mode: 'no-cors',
      method: 'HEAD'
    })
    .then(() => console.log("Google domains seem accessible"))
    .catch(err => console.error("Cannot access Google domains:", err));
  }, [location]);

  // Check URL parameters and handle auth redirects
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Handle auth errors
    if (error) {
      console.error("Auth redirect error:", error, errorDescription);
      const errorMessage = errorDescription || "Authentication error";
      setAuthError(errorMessage);
      toast.error(errorMessage);
    }
    
    // Handle successful auth callbacks
    if (location.hash) {
      console.log("Detected auth callback with hash:", location.hash);
      
      // Try to parse the hash for access_token (common in OAuth flows)
      if (location.hash.includes("access_token")) {
        console.log("Access token detected in URL hash");
      }
    }
    
    // Set to signup mode if redirected from signup flow
    if (params.get('type') === 'signup') {
      setMode('signup');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // If user is authenticated but hasn't completed onboarding, redirect to onboarding
      if (user && !user.onboardingCompleted) {
        console.log("User authenticated but hasn't completed onboarding, redirecting to onboarding");
        navigate("/onboarding", { replace: true });
        return;
      }
      
      // Otherwise redirect to dashboard or the page they were trying to access
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("User is authenticated and has completed onboarding, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, user]);

  // Clear auth errors when mode changes
  useEffect(() => {
    setAuthError(null);
  }, [mode]);

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex flex-col p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-gray-50 min-h-screen md:min-h-0">
        <AuthHeader />

        <div className="flex-1 flex flex-col items-center justify-center py-6 md:py-0">
          {authError && (
            <Alert variant="destructive" className="mb-6 max-w-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          )}
          <AuthForm mode={mode} setMode={setMode} />
        </div>
      </div>

      {/* Right side - Marketing content - Hidden on mobile */}
      <div className="hidden md:block bg-gradient-to-br from-green-500 via-green-400 to-green-600 p-8 flex items-center justify-center overflow-hidden relative">
        <DecorativeBackground />
        <FeatureDisplay />
      </div>
    </div>
  );
};

export default Auth;
