
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "./types";

export const login = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error("Login error:", error);
      throw error;
    }

    const userData = {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata?.name || "User",
      avatar: data.user.user_metadata?.avatar || "",
      onboardingCompleted: data.user.user_metadata?.onboardingCompleted || false
    };

    console.log("Login successful:", userData);
    toast.success("Login successful!");
  } catch (error: any) {
    console.error("Login error:", error);
    toast.error(error.message || "Failed to login");
    throw error;
  }
};

export const logout = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    console.log("Logged out successfully");
    toast.success("Logged out successfully");
    return true;
  } catch (error: any) {
    console.error("Logout error:", error);
    toast.error(error.message || "Failed to logout");
    return false;
  }
};

export const signup = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          avatar: "",
          onboardingCompleted: false
        }
      }
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    if (data.user) {
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || name,
        avatar: data.user.user_metadata?.avatar || "",
        onboardingCompleted: false
      };
      
      console.log("Signup successful:", userData);
      toast.success("Account created successfully! You can now log in.");
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    toast.error(error.message || "Failed to create account");
    throw error;
  }
};

export const completeOnboarding = async (user: User | null) => {
  if (user) {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { onboardingCompleted: true }
      });

      if (error) throw error;

      const updatedUser = { 
        ...user, 
        onboardingCompleted: true 
      };
      
      console.log("Completing onboarding, updated user:", updatedUser);
      return updatedUser;
    } catch (error: any) {
      console.error("Error updating user metadata:", error);
      toast.error(error.message || "Failed to update user profile");
      return null;
    }
  } else {
    console.error("Cannot complete onboarding: no user is logged in");
    return null;
  }
};
