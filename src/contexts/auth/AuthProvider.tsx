import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { AuthContext } from "./AuthContext";
import { login, logout, signup, signInWithGoogle } from "./authActions";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Handle initial session and auth state changes
    const initializeAuth = async () => {
      try {
        console.log("Setting up auth state change listener");
        // First set up the listener before checking session
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log("Auth state change:", event, session?.user?.id);
            
            if (!mounted) return;
            
            if (session) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || "User",
                avatar: session.user.user_metadata?.avatar || "",
                onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
              };
              
              setUser(userData);
              console.log("User metadata:", session.user.user_metadata);
            } else {
              setUser(null);
            }
          }
        );

        // Now check for existing session
        console.log("Checking for initial session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
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
            console.log("User metadata:", session.user.user_metadata);
          } else {
            console.log("No initial session found");
            setUser(null);
          }
          
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Cleanup function
    return () => {
      mounted = false;
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

  const handleCompleteOnboarding = async (currentUser: User | null) => {
    if (!currentUser) return null;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { onboardingCompleted: true }
      });
      
      if (error) throw error;
      
      const updatedUser = {
        ...currentUser,
        onboardingCompleted: true
      };
      
      setUser(updatedUser);
      console.log("Onboarding completed successfully:", updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error("Error completing onboarding:", error);
      return currentUser;
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

  const handleSignInWithGoogle = async () => {
    await signInWithGoogle();
  };

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
        verifyOtp,
        signInWithGoogle: handleSignInWithGoogle
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
