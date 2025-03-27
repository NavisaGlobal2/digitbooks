
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
    // Use the database function we created
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.rpc('create_team_invite', {
      p_name: teamMember.name,
      p_email: teamMember.email,
      p_role: teamMember.role
    });
    
    if (error) {
      console.error("Error inviting team member:", error);
      throw error;
    }
    
    // Create a properly typed response that matches what we'd expect
    const typedData = {
      id: data.id,
      user_id: '', // This will be assigned when the invitation is accepted
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
