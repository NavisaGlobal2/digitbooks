
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

// Flag to control database connectivity - must be the same as in fetchTeamMembers.ts
const OFFLINE_MODE = true;

export const updateTeamMember = async (id: string, updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
  if (OFFLINE_MODE) {
    console.log("Running in offline mode - simulating team member update");
    
    // Create a mock updated team member
    const mockUpdatedMember = {
      id: id,
      user_id: 'offline-user',
      name: updates.name || 'Updated Name',
      email: updates.email || 'updated@example.com',
      role: updates.role || 'Member' as TeamMemberRole,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    toast.success("Team member updated successfully (offline mode)");
    return mockUpdatedMember;
  }

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase
      .from('team_members')
      .update({ 
        ...updates, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error("Supabase error updating team member:", error);
      throw error;
    }
    
    // Ensure the role property is correctly typed
    const typedData = {
      ...data,
      role: data.role as TeamMemberRole
    } as TeamMember;
    
    toast.success("Team member updated successfully");
    return typedData;
  } catch (error: any) {
    handleTeamError(error, "Failed to update team member");
    return null;
  }
};
