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
        },
        emailRedirectTo: window.location.origin + "/auth" 
      }
    });

    if (error) {
      console.error("Signup error:", error);
      throw error;
    }

    console.log("Signup response:", data);
    
    if (data.user) {
      if (data.user.identities && data.user.identities.length === 0) {
        throw new Error("Email already in use. Please login instead.");
      }
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || name,
        avatar: data.user.user_metadata?.avatar || "",
        onboardingCompleted: false
      };
      
      console.log("Signup successful:", userData);
      toast.success("Verification email sent! Please check your inbox.");
      return { newUser: true, email: data.user.email };
    } else {
      throw new Error("Signup failed");
    }
  } catch (error: any) {
    console.error("Signup error:", error);
    if (error.message.includes("already in use")) {
      toast.error("Email already in use. Please login instead.");
    } else {
      toast.error(error.message || "Failed to create account");
    }
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

export const signInWithGoogle = async () => {
  try {
    console.log("Starting Google authentication flow...");
    
    // Get the canonical URL (in case we're on a custom domain or subdomain)
    console.log("Current window location details:", {
      origin: window.location.origin,
      pathname: window.location.pathname,
      href: window.location.href,
      host: window.location.host
    });
    
    // For Supabase Google auth, the redirect must go to a URL that's
    // allowed in both the Google console and Supabase settings
    const redirectUrl = window.location.origin + "/auth";
    
    console.log("Using redirect URL for Google auth:", redirectUrl);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error("Google login error:", error);
      toast.error(error.message || "Failed to connect to Google authentication");
      throw error;
    }

    if (!data || !data.url) {
      const noUrlError = new Error("Failed to get authentication URL from Supabase");
      console.error("Google login error:", noUrlError);
      toast.error("Unable to connect to authentication service. Please try again later.");
      throw noUrlError;
    }

    console.log("Google login initiated successfully. Redirecting to:", data.url);
    
    // Redirect manually to avoid potential issues
    window.location.href = data.url;
    
    return data;
  } catch (error: any) {
    console.error("Google login error:", error);
    toast.error(error.message || "Failed to login with Google. Please check your internet connection and try again.");
    throw error;
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    
    if (error) throw error;
    
    console.log("Verification email resent:", data);
    toast.success("Verification email resent successfully!");
    return true;
  } catch (error: any) {
    console.error("Error resending verification email:", error);
    toast.error(error.message || "Failed to resend verification email");
    return false;
  }
};

export const checkUserOnboardingStatus = async (userId: string): Promise<boolean> => {
  try {
    // First check if the user has onboardingCompleted set in metadata
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) throw userError;
    
    // If onboardingCompleted is explicitly set to true in user metadata, user has completed onboarding
    if (userData.user.user_metadata?.onboardingCompleted === true) {
      console.log("User has completed onboarding according to metadata");
      return true;
    }
    
    // If not set or false, check if they have a profile in the database
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error checking profile data:", profileError);
      // Don't throw here, just continue with the check
    }
    
    // If they have a profile with business_name set, they've likely completed onboarding
    if (profileData && profileData.business_name) {
      console.log("User has a business profile, updating metadata");
      
      // Update the user metadata to mark onboarding as completed
      await supabase.auth.updateUser({
        data: { onboardingCompleted: true }
      });
      
      return true;
    }
    
    console.log("User needs to complete onboarding");
    return false;
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    // Default to false if there's an error
    return false;
  }
};
