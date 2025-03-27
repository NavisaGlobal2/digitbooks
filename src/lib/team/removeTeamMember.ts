
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

// Flag to control database connectivity - must be the same as in fetchTeamMembers.ts
const OFFLINE_MODE = false;

export const removeTeamMember = async (id: string) => {
  if (OFFLINE_MODE) {
    console.log("Running in offline mode - simulating team member removal");
    toast.success("Team member removed successfully (offline mode)");
    return true;
  }

  try {
    const { supabase } = await import("@/integrations/supabase/client");
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error("Supabase error removing team member:", error);
      throw error;
    }
    
    toast.success("Team member removed successfully");
    return true;
  } catch (error: any) {
    handleTeamError(error, "Failed to remove team member");
    return false;
  }
};
