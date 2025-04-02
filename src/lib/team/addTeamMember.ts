
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { canManageTeam } from "./userPermissions";

/**
 * Adds a new team member directly
 * @param name - The name of the person being added
 * @param email - The email address of the team member
 * @param role - The role to assign to the new team member
 * @returns Promise with the adding result
 */
export const addTeamMember = async (
  name: string,
  email: string,
  role: TeamMemberRole
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Verify the current user has permission to add team members
    const hasPermission = await canManageTeam();
    if (!hasPermission) {
      throw new Error("You don't have permission to add team members");
    }

    // Get current user info
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("You must be logged in to add team members");
    }

    // Check if the email already exists in the team
    const { data: existingMember, error: checkError } = await supabase
      .from('team_members')
      .select('id')
      .eq('email', email)
      .maybeSingle();
    
    if (checkError) {
      throw new Error("Failed to check if team member already exists");
    }
    
    if (existingMember) {
      throw new Error("A team member with this email already exists");
    }

    // Add the team member
    const { error: insertError } = await supabase
      .from('team_members')
      .insert({
        name,
        email,
        role,
        status: 'pending',
        user_id: null, // Will be updated when the user registers
        business_id: user?.user_metadata?.business_id // Add the business_id if your schema requires it
      });

    if (insertError) {
      console.error("Supabase error adding team member:", insertError);
      throw insertError;
    }

    // Create invitation with proper type definition for the response
    interface TeamInviteResponse {
      id: string;
      token: string;
    }

    const { data, error: inviteError } = await supabase.rpc<TeamInviteResponse>('create_team_invite', {
      p_name: name,
      p_email: email,
      p_role: role
    });

    if (inviteError) {
      console.error("Error creating team invitation:", inviteError);
      throw inviteError;
    }

    // Send invitation email
    const inviteResponse = await fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/send-team-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
      },
      body: JSON.stringify({
        token: data?.token || "",
        email,
        inviterName: user?.user_metadata?.name || user?.email || "Your team admin",
        role,
        name
      })
    });

    if (!inviteResponse.ok) {
      console.warn("Warning: Invitation email may not have been sent");
    }

    toast.success(`Team member ${name} added successfully`);
    return { success: true };
  } catch (error) {
    console.error("Error adding team member:", error);
    toast.error(error instanceof Error ? error.message : "Failed to add team member");
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to add team member" 
    };
  }
};
