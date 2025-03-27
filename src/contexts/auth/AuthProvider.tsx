
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
    // Handle initial session
    const getInitialSession = async () => {
      try {
        console.log("Checking for initial session...");
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
        } else {
          console.log("No initial session found");
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Set up auth state change listener
    const setupAuthListener = () => {
      console.log("Setting up auth state change listener");
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
            console.log("User metadata:", session.user.user_metadata);
          } else {
            setUser(null);
          }
        }
      );

      return subscription;
    };

    const subscription = setupAuthListener();
    getInitialSession();

    // Cleanup subscription
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
