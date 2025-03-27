
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { AuthContext } from "./AuthContext";
import { login, logout, signup, completeOnboarding, signInWithGoogle } from "./authActions";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Set to false since we're not connecting

  // Since we're disconnected, we'll skip the actual auth checks
  const isAuthenticated = false;

  const handleLogin = async (email: string, password: string) => {
    console.log("Database disconnected: Login function disabled");
    return null;
  };

  const handleLogout = async () => {
    console.log("Database disconnected: Logout function disabled");
    return true;
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    console.log("Database disconnected: Signup function disabled");
    return null;
  };

  const handleCompleteOnboarding = async () => {
    console.log("Database disconnected: Complete onboarding function disabled");
    return null;
  };

  const verifyOtp = async (email: string, token: string) => {
    console.log("Database disconnected: Verify OTP function disabled");
    return null;
  };

  const handleSignInWithGoogle = async () => {
    console.log("Database disconnected: Sign in with Google function disabled");
    return null;
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        login: handleLogin, 
        logout: handleLogout, 
        signup: handleSignup, 
        completeOnboarding: handleCompleteOnboarding,
        verifyOtp,
        signInWithGoogle: handleSignInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
