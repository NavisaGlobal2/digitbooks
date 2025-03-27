
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

export const updateTeamMember = async (id: string, updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
  try {
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
