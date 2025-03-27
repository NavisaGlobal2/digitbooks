
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

// Flag to control database connectivity - must be the same as in fetchTeamMembers.ts
const OFFLINE_MODE = false;

export const inviteTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  if (OFFLINE_MODE) {
    console.log("Running in offline mode - simulating team member invite");
    
    const mockTeamMember = {
      id: `mock-${Date.now()}`,
      user_id: 'offline-user',
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    toast.success(`Invitation sent to ${teamMember.email} (offline mode)`);
    return mockTeamMember;
  }

  try {
    // Get the current user
    const { supabase } = await import("@/integrations/supabase/client");
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
