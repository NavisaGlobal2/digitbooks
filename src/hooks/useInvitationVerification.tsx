
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

interface InvitationVerificationResult {
  isVerifying: boolean;
  isAccepted: boolean;
  invitationDetails: TeamMember | null;
  acceptInvitation: () => Promise<void>;
}

export const useInvitationVerification = (token: string | null): InvitationVerificationResult => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<TeamMember | null>(null);

  useEffect(() => {
    const verifyInvitation = async () => {
      if (!token) {
        toast.error("Invalid invitation link");
        return;
      }

      try {
        setIsVerifying(true);
        // Fetch the invitation details
        const { data, error } = await supabase
          .from("team_members")
          .select("*")
          .eq("id", token)
          .eq("status", "pending")
          .single();

        if (error || !data) {
          console.error("Error fetching invitation:", error);
          toast.error("Invitation not found or has expired");
          return;
        }

        setInvitationDetails({
          id: data.id,
          user_id: data.user_id || "",
          name: data.name,
          email: data.email,
          role: data.role as TeamMemberRole,
          status: data.status as 'active' | 'pending' | 'inactive',
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } catch (error) {
        console.error("Error verifying invitation:", error);
        toast.error("Failed to verify invitation");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyInvitation();
  }, [token]);

  const acceptInvitation = async () => {
    if (!token || !invitationDetails) return;
    
    try {
      setIsVerifying(true);
      
      // Here you would typically:
      // 1. Create a user account if they don't have one
      // 2. Update the team_member status to 'active'
      // 3. Associate the user_id with the team_member
      
      // For now, we'll just update the status to simulate acceptance
      const { error } = await supabase
        .from("team_members")
        .update({ status: "active" })
        .eq("id", token);

      if (error) {
        throw error;
      }

      setIsAccepted(true);
      toast.success("Invitation accepted! You're now part of the team.");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast.error("Failed to accept invitation");
    } finally {
      setIsVerifying(false);
    }
  };

  return {
    isVerifying,
    isAccepted,
    invitationDetails,
    acceptInvitation
  };
};
