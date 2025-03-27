
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
  const [isLoading, setIsLoading] = useState(true);

  // Setup auth state listener and check for existing session
  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        setIsLoading(false);
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || "User",
            avatar: session.user.user_metadata?.avatar || "",
            onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || "User",
          avatar: session.user.user_metadata?.avatar || "",
          onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
        };
        setUser(userData);
      }
      
      setIsLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        login, 
        logout, 
        signup, 
        completeOnboarding,
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
        signInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
