
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
import { supabase } from "@/integrations/supabase/client";

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { isAuthenticated, isInitialized } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [processingAuth, setProcessingAuth] = useState(false);

  // Handle URL parameters on load
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('type') === 'signup') {
      setMode('signup');
    }
  }, [location]);

  // Handle OAuth callbacks and errors
  useEffect(() => {
    if (!isInitialized) return;
    
    const handleAuthCallback = async () => {
      const params = new URLSearchParams(location.search);
      const error = params.get('error');
      const errorDescription = params.get('error_description');
      
      // Only process if there's an error or a hash (likely OAuth callback)
      if (error || location.hash) {
        console.log("Processing auth callback");
        setProcessingAuth(true);
        
        try {
          if (error) {
            console.error("Auth redirect error:", error, errorDescription);
            const errorMessage = errorDescription || "Authentication error";
            setAuthError(errorMessage);
            toast.error(errorMessage);
            return;
          }
          
          if (location.hash) {
            console.log("Detected auth callback with hash");
            // Hash will be processed automatically by supabase client
            // Just check if we have a session
            const { data } = await supabase.auth.getSession();
            
            if (data.session) {
              console.log("Session obtained after hash callback");
              // Redirect to dashboard or onboarding based on metadata
              const needsOnboarding = !data.session.user.user_metadata?.onboardingCompleted;
              
              // Check profile as fallback for onboarding status
              if (needsOnboarding) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('business_name')
                  .eq('id', data.session.user.id)
                  .maybeSingle();
                
                if (profile?.business_name) {
                  navigate("/dashboard", { replace: true });
                } else {
                  navigate("/onboarding", { replace: true });
                }
              } else {
                navigate("/dashboard", { replace: true });
              }
            }
          }
        } catch (err) {
          console.error("Error handling auth callback:", err);
        } finally {
          setProcessingAuth(false);
        }
      }
    };

    handleAuthCallback();
  }, [location, navigate, isInitialized]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated && !processingAuth) {
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location, isInitialized, processingAuth]);

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
