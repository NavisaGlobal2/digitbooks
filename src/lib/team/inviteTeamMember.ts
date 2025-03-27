
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

export const inviteTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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

    // Use a direct SQL insert via RPC to bypass RLS policies
    const { data, error } = await supabase.rpc('insert_team_member', {
      p_name: teamMember.name,
      p_email: teamMember.email,
      p_role: teamMember.role,
      p_status: 'pending',
      p_user_id: user.id
    });
    
    if (error) {
      console.error("Error inviting team member:", error);
      throw error;
    }
    
    // Fix: Cast the data to any to access the id property
    const responseData = data as any;
    const newId = responseData.id;
    
    // Create a properly typed response that matches what we'd get from a direct insert
    const typedData = {
      id: newId,
      user_id: user.id,
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role as TeamMemberRole,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    toast.success(`Invitation sent to ${teamMember.email}`);
    return typedData;
  } catch (error: any) {
    handleTeamError(error, "Failed to invite team member");
    return null;
  }
};
