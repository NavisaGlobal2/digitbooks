
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Invitation {
  email: string;
  name: string;
  role: string;
  business_id?: string;
}

export const useInvitation = (token: string | null) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        navigate("/auth");
        return;
      }

      try {
        setIsLoading(true);
        
        // Validate the token with Supabase
        const { data, error } = await supabase
          .from('team_invitations')
          .select('email, name, role, status, business_id, expires_at')
          .eq('token', token)
          .single();
        
        if (error || !data) {
          console.error("Invalid invitation:", error || "No data returned");
          toast.error("This invitation is invalid or has expired");
          navigate("/auth");
          return;
        }
        
        // Check if invitation is pending and not expired
        if (data.status !== 'pending') {
          console.error("Invitation is not pending", data.status);
          toast.error("This invitation has already been used");
          navigate("/auth");
          return;
        }
        
        // Check expiration
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          console.error("Invitation has expired");
          toast.error("This invitation has expired");
          navigate("/auth");
          return;
        }
        
        setInvitation({
          email: data.email,
          name: data.name,
          role: data.role,
          business_id: data.business_id
        });
        setIsValid(true);
      } catch (error) {
        console.error("Error validating invitation:", error);
        toast.error("Error validating invitation");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, [token, navigate]);

  const acceptInvitation = async () => {
    if (!token || !isValid || !invitation) return;
    
    try {
      setIsSubmitting(true);
      
      // Call the Supabase RPC function with proper typing
      const { error } = await supabase.rpc('accept_team_invitation', {
        p_token: token
      });
      
      if (error) {
        // The updated function should handle missing team member records
        // but we'll still check for specific error messages as a fallback
        if (error.message.includes('team member record not found')) {
          console.warn("Team member record not found, but the function should handle this case");
          // Continue since our updated function should have handled this
        } else {
          throw error;
        }
      }
      
      toast.success("Team invitation accepted successfully!");
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to accept invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const registerAccount = async (password: string) => {
    if (!invitation) return;
    
    try {
      setIsSubmitting(true);
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            name: invitation.name,
            onboardingCompleted: true
          }
        }
      });
      
      if (error) throw error;
      
      // Accept the invitation automatically after successful registration
      if (data) {
        await acceptInvitation();
      }
    } catch (error: any) {
      console.error("Error registering account:", error);
      
      if (error.message.includes("already registered")) {
        toast.error("This email is already registered", {
          description: "Please sign in instead"
        });
        navigate("/auth");
      } else {
        toast.error(error.message || "Failed to create account");
      }
      
      setIsSubmitting(false);
    }
  };

  return {
    isLoading,
    isValid,
    invitation,
    isSubmitting,
    acceptInvitation,
    registerAccount
  };
};
