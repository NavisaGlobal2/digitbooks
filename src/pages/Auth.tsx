
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import FeatureDisplay from "@/components/auth/FeatureDisplay";
import AuthHeader from "@/components/auth/AuthHeader";
import DecorativeBackground from "@/components/auth/DecorativeBackground";

type AuthMode = 'login' | 'signup';

const Auth: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<AuthMode>('login'); // Default to login mode

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
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
        {/* Animated background shapes */}
        <DecorativeBackground />
        <FeatureDisplay />
      </div>
    </div>
  );
};

export default Auth;
