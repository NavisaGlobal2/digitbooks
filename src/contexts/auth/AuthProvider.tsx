
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
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log("Auth initialization started");
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initializeAuth = async () => {
      try {
        // First, set up the auth state listener to catch any changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, session) => {
            console.log("Auth state changed:", event);
            
            if (session) {
              const userData = {
                id: session.user.id,
                email: session.user.email,
                name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
                avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.picture || "",
                onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
              };
              setUser(userData);
            } else {
              setUser(null);
            }
          }
        );
        
        authSubscription = subscription;

        // Then check for the initial session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("Initial session found");
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || "User",
            avatar: session.user.user_metadata?.avatar || session.user.user_metadata?.picture || "",
            onboardingCompleted: session.user.user_metadata?.onboardingCompleted || false
          };
          
          setUser(userData);
          
          // Optimize by checking onboarding status only when needed
          if (!userData.onboardingCompleted) {
            // Use setTimeout to avoid blocking the main thread
            setTimeout(async () => {
              try {
                const profileResult = await supabase
                  .from('profiles')
                  .select('business_name')
                  .eq('id', session.user.id)
                  .maybeSingle();
                
                if (profileResult.data?.business_name) {
                  // Only update user metadata if needed
                  await supabase.auth.updateUser({
                    data: { onboardingCompleted: true }
                  });
                  
                  setUser(prev => prev ? {...prev, onboardingCompleted: true} : null);
                }
              } catch (error) {
                console.error("Error checking profile:", error);
              }
            }, 0);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        console.log("Auth initialization completed");
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
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
        signInWithGoogle: handleSignInWithGoogle,
        isInitialized
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
