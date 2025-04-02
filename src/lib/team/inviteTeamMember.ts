
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { canManageTeam } from "./userPermissions";
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from "@/contexts/auth";

/**
 * Invites a new team member via email
 * @param name - The name of the person being invited
 * @param email - The email address to send the invitation to
 * @param role - The role to assign to the new team member
 * @returns Promise with the invitation result
 */
export const inviteTeamMember = async (
  name: string,
  email: string,
  role: TeamMemberRole
): Promise<{ id: string; token: string }> => {
  try {
    // Verify the current user has permission to invite team members
    const hasPermission = await canManageTeam();
    if (!hasPermission) {
      throw new Error("You don't have permission to invite team members");
    }

    // Create a database function call to handle the invitation
    const { data, error } = await supabase.rpc('create_team_invite', {
      p_name: name,
      p_email: email,
      p_role: role
    });

    if (error) {
      console.error("Supabase error creating team invitation:", error);
      // Check for specific error messages
      if (error.message.includes("role")) {
        throw new Error("You don't have permission to assign this role");
      }
      throw error;
    }

    // Get current user info for the email
    const { data: { user } } = await supabase.auth.getUser();
    const inviterName = user?.user_metadata?.name || user?.email || "Your team admin";

    // Send the invitation email via edge function
    const inviteResponse = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-team-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        token: data.token,
        email,
        inviterName,
        role,
        name
      })
    });

    if (!inviteResponse.ok) {
      const errorData = await inviteResponse.json();
      console.error("Error sending invitation email:", errorData);
      // Don't throw here - we've created the invitation in the database,
      // but the email failed. The admin can resend or manage invites later.
      toast.warning("Invitation created but email delivery may be delayed");
    }

    // Insert a pending team member
    const { error: memberError } = await supabase
      .from('team_members')
      .insert({
        name,
        email,
        role,
        status: 'pending',
      });

    if (memberError) {
      console.error("Error creating pending team member:", memberError);
      // Don't throw - this is a secondary action
    }

    toast.success(`Invitation sent to ${email}`);
    return data;
  } catch (error) {
    console.error("Error inviting team member:", error);
    toast.error(error instanceof Error ? error.message : "Failed to invite team member");
    throw error;
  }
};
