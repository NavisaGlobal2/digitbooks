
import { useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { AuthContext } from "./AuthContext";
import { login, logout, signup, signInWithGoogle, checkUserOnboardingStatus } from "./authActions";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Get basic user data from session
          const onboardingCompleted = session.user.user_metadata?.onboardingCompleted || false;
          
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
            avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.picture || "",
            onboardingCompleted: onboardingCompleted
          };
          
          console.log("Initial session found:", userData);
          
          // For all logins (including social), check onboarding status explicitly
          // to ensure consistent behavior
          const hasCompletedOnboarding = await checkUserOnboardingStatus(session.user.id);
          if (hasCompletedOnboarding) {
            userData.onboardingCompleted = true;
          }
          
          setUser(userData);
        }
      } catch (error) {
        console.error("Error getting initial session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        
        if (session) {
          // Initialize with metadata from session
          const onboardingCompleted = session.user.user_metadata?.onboardingCompleted || false;
          
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
            avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.picture || "",
            onboardingCompleted: onboardingCompleted
          };
          
          // For all auth events, ensure consistent onboarding check
          if ((event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
            // Use setTimeout to avoid triggering within the auth state change callback
            setTimeout(async () => {
              const hasCompletedOnboarding = await checkUserOnboardingStatus(session.user.id);
              if (hasCompletedOnboarding) {
                setUser(prev => prev ? {...prev, onboardingCompleted: true} : null);
              }
            }, 0);
          }
          
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
