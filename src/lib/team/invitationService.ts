
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

/**
 * Invites a new team member and sends an invitation email
 */
export const inviteTeamMember = async (
  teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<TeamMember | null> => {
  try {
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw userError;
    }
    
    if (!user) {
      toast.error("You must be logged in to invite team members");
      return null;
    }

    console.log("Current user:", user.id);
    console.log("Inviting team member:", teamMember);

    // Try a direct insert first
    const { data: directData, error: directError } = await supabase
      .from('team_members')
      .insert({
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role,
        status: 'pending',
        user_id: user.id
      })
      .select()
      .single();
    
    // If direct insert succeeds, use that data
    if (!directError && directData) {
      console.log("Direct insert successful:", directData);
      
      // Create properly typed result
      const typedData = {
        ...directData,
        role: directData.role as TeamMemberRole
      } as TeamMember;
      
      // Try to send email but don't block on it
      try {
        await sendInvitationEmail(typedData, user);
        toast.success(`Invitation sent to ${teamMember.email}`);
      } catch (emailError) {
        console.error("Error sending invitation email:", emailError);
        toast.warning("Team member added but invitation email could not be sent");
      }
      
      return typedData;
    }
    
    // If direct insert fails, try the RPC method as fallback
    console.log("Direct insert failed, trying RPC:", directError);
    
    // Use a SQL function via RPC to bypass RLS policies
    const { data, error } = await supabase.rpc('insert_team_member', {
      p_name: teamMember.name,
      p_email: teamMember.email,
      p_role: teamMember.role,
      p_status: 'pending',
      p_user_id: user.id
    });
    
    if (error) {
      console.error("RPC error inviting team member:", error);
      throw error;
    }
    
    console.log("RPC response:", data);
    
    // The RPC function returns a JSON object with an 'id' property
    let memberId = '';
    
    // Handle the different potential response formats
    if (data && typeof data === 'object') {
      memberId = (data as { id: string }).id;
    } else if (data && typeof data === 'string') {
      try {
        // Try to parse if it's a JSON string
        const parsedData = JSON.parse(data);
        memberId = parsedData.id || '';
      } catch (e) {
        console.error("Error parsing ID from response:", e);
        memberId = '';
      }
    }
    
    if (!memberId) {
      throw new Error("Failed to get member ID from response");
    }
    
    // Create a properly typed response that matches what we'd get from a direct insert
    const typedData = {
      id: memberId,
      user_id: user.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role as TeamMemberRole,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    try {
      // Send the invitation email through our Edge Function
      await sendInvitationEmail(typedData, user);
      
      toast.success(`Invitation sent to ${teamMember.email}`);
    } catch (inviteError) {
      console.error("Error sending invitation email:", inviteError);
      // We don't throw here because the team member was already created,
      // we just couldn't send the email
      toast.warning("Team member added but invitation email could not be sent");
    }
    
    return typedData;
  } catch (error: any) {
    console.error("Error inviting team member:", error);
    
    if (error.message && error.message.includes("permission denied")) {
      toast.error("Permission issue while inviting team member. Please contact an administrator.");
    } else {
      toast.error(error.message || "Failed to invite team member");
    }
    
    throw error;
  }
};

/**
 * Sends an invitation email to a team member
 */
const sendInvitationEmail = async (
  teamMember: TeamMember, 
  currentUser: any
): Promise<void> => {
  try {
    // Get the current user's info to include in the invitation
    const response = await supabase.functions.invoke('send-invitation', {
      body: {
        teamMember: teamMember,
        invitedBy: {
          id: currentUser?.id,
          name: currentUser?.user_metadata?.name,
          email: currentUser?.email
        }
      }
    });
    
    if (response.error) {
      console.error("Error calling invitation function:", response.error);
      toast.error("Invitation created but email sending failed. Please try again or contact support.");
      throw response.error;
    } else {
      console.log("Invitation function response:", response.data);
    }
  } catch (inviteError) {
    console.error("Error sending invitation:", inviteError);
    // We don't throw here because the team member was already created,
    // we just couldn't send the email
    toast.warning("Team member added but invitation email could not be sent");
    throw inviteError;
  }
};
