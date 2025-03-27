
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
import { checkUserOnboardingStatus } from "@/contexts/auth/authActions";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login mode
  const [authError, setAuthError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(false);

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
  }, [location]);

  // Handle OAuth callbacks and auth state
  useEffect(() => {
    const handleAuthCallback = async () => {
      setProcessingAuth(true);
      
      try {
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
          setProcessingAuth(false);
          return;
        }
        
        // Handle hash fragments (common in OAuth flows)
        if (location.hash) {
          console.log("Detected auth callback with hash:", location.hash);
          
          // Ensure the callback is processed by Supabase
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error("Error processing auth callback:", error);
            setAuthError(error.message);
            toast.error(error.message);
          } else if (data.session) {
            console.log("Session obtained after hash callback");
            // For social login specifically, check if the user needs to complete onboarding
            const userId = data.session.user.id;
            const hasCompletedOnboarding = await checkUserOnboardingStatus(userId);
            
            // Redirect to appropriate place based on onboarding status
            if (hasCompletedOnboarding) {
              navigate("/dashboard", { replace: true });
            } else {
              navigate("/onboarding", { replace: true });
            }
          }
        }
      } catch (err) {
        console.error("Error handling auth callback:", err);
      } finally {
        setProcessingAuth(false);
      }
    };

    handleAuthCallback();
    
    // Set to signup mode if redirected from signup flow
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'signup') {
      setMode('signup');
    }
  }, [location, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Get the intended destination
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

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
          {processingAuth ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Processing authentication...</p>
            </div>
          ) : (
            <>
              {authError && (
                <Alert variant="destructive" className="mb-6 max-w-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{authError}</AlertDescription>
                </Alert>
              )}
              <AuthForm mode={mode} setMode={setMode} />
            </>
          )}
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
