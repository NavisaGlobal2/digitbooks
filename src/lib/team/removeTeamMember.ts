
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

export const removeTeamMember = async (id: string) => {
  try {
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
