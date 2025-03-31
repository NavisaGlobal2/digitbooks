
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";

// Login function
export const login = async (email: string, password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (error) {
    console.error("Error during sign in:", error);
    throw error;
  }
};

// Sign up function
export const signup = async (email: string, password: string, name: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          onboardingCompleted: false,
        },
      },
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error during sign up:", error);
    throw error;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error("Error during sign out:", error);
    throw error;
  }
};

// Complete onboarding
export const completeOnboarding = async (user: User): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        onboardingCompleted: true
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw error;
  }
};

// Sign in with Google
export const signInWithGoogle = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) throw error;
  } catch (error) {
    console.error("Error during Google sign in:", error);
    throw error;
  }
};

// Resend verification email
export const resendVerificationEmail = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email
    });
    
    if (error) throw error;
  } catch (error) {
    console.error("Error resending verification email:", error);
    throw error;
  }
};
