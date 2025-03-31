
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { AuthContext } from "./AuthContext";
import { login, logout, signup, completeOnboarding, signInWithGoogle } from "./authActions";

interface AuthProviderProps {
  children: ReactNode;
}

// For now, we'll create a mock implementation that allows the app to run
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>({
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    onboardingCompleted: true
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = true; // For demo purposes

  // Wrapper functions that match the expected types in AuthContextValue
  const handleSignup = async (email: string, password: string, name: string): Promise<void> => {
    await signup(email, password, name);
  };

  const handleCompleteOnboarding = (): void => {
    if (user) {
      completeOnboarding(user);
    }
  };

  const handleSignInWithGoogle = async (): Promise<void> => {
    await signInWithGoogle();
  };

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        logout, 
        signup: handleSignup, 
        completeOnboarding: handleCompleteOnboarding,
        verifyOtp: async (email, token) => {
          try {
            const { data, error } = await supabase.auth.verifyOtp({
              email,
              token,
              type: 'signup'
            });
            
            if (error) throw error;
            return data;
          } catch (error) {
            console.error("Error verifying OTP:", error);
            throw error;
          }
        },
        signInWithGoogle: handleSignInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
