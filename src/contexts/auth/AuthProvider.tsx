
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
    let isMounted = true;
    
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session && isMounted) {
          console.log("Initial session user metadata:", session.user.user_metadata);
          
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
        // Only set loading to false if component is still mounted
        if (isMounted) {
          console.log("Initial auth loading complete");
          setIsLoading(false);
        }
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        console.log("Auth state change user metadata:", session?.user?.user_metadata);
        
        if (session && isMounted) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || "User",
            avatar: session.user.user_metadata?.avatar || "",
            onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
          };
          
          setUser(userData);
        } else if (isMounted) {
          setUser(null);
        }
      }
    );

    // Cleanup function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // If auth is still loading but taking too long, log a warning
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn("Auth loading is taking longer than expected");
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

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
