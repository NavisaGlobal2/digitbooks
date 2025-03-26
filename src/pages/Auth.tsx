
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import FeatureDisplay from "@/components/auth/FeatureDisplay";
import AuthHeader from "@/components/auth/AuthHeader";
import DecorativeBackground from "@/components/auth/DecorativeBackground";
import { toast } from "sonner";

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login mode

  // Check URL parameters and handle auth redirects
  useEffect(() => {
    // Parse URL parameters
    const params = new URLSearchParams(location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    
    // Handle auth errors
    if (error) {
      console.error("Auth redirect error:", error, errorDescription);
      toast.error(errorDescription || "Authentication error");
    }
    
    // Handle successful auth callbacks
    if (location.hash) {
      console.log("Detected auth callback with hash:", location.hash);
    }
    
    // Set to signup mode if redirected from signup flow
    if (params.get('type') === 'signup') {
      setMode('signup');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      console.log("User is authenticated, redirecting to:", from);
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  return (
    <div className="min-h-screen flex flex-col md:grid md:grid-cols-2">
      {/* Left side - Auth form */}
      <div className="flex flex-col p-4 sm:p-6 md:p-8 bg-gradient-to-b from-white to-gray-50 min-h-screen md:min-h-0">
        <AuthHeader />

        <div className="flex-1 flex items-center justify-center py-6 md:py-0">
          <AuthForm mode={mode} setMode={setMode} />
        </div>
      </div>

      {/* Right side - Marketing content */}
      <div className="hidden md:block bg-gradient-to-br from-green-500 via-green-400 to-green-600 p-8 flex items-center justify-center overflow-hidden relative">
        <DecorativeBackground />
        <FeatureDisplay />
      </div>
    </div>
  );
};

export default Auth;
