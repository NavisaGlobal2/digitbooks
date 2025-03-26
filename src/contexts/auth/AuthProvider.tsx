
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { AuthContext } from "./AuthContext";
import { login, logout, signup, completeOnboarding as completeUserOnboarding } from "./authActions";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active session on load
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || "User",
            avatar: session.user.user_metadata?.avatar || "",
            onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
          };
          
          console.log("Initial session found:", userData);
          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        
        if (session) {
          const userData = {
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAuthenticated = !!user;

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      setUser(null);
    }
  };

  const handleSignup = async (email: string, password: string, name: string) => {
    await signup(email, password, name);
  };

  const handleCompleteOnboarding = async () => {
    const updatedUser = await completeUserOnboarding(user);
    if (updatedUser) {
      setUser(updatedUser);
    }
  };

  const verifyOtp = async (email: string, token: string) => {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'signup'
      });
      
      if (error) throw error;
      
      console.log("OTP verification successful:", data);
      return data;
    } catch (error: any) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  // Don't render until we have checked for a session
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <AuthContext.Provider
      value={{ 
        user, 
        isAuthenticated, 
        login: handleLogin, 
        logout: handleLogout, 
        signup: handleSignup, 
        completeOnboarding: handleCompleteOnboarding,
        verifyOtp
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
