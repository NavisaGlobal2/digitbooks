
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/teamMember";
import { toast } from "sonner";
import { canManageTeam } from "./userPermissions";

/**
 * Updates a team member's details
 * @param id - The ID of the team member to update
 * @param updates - The updates to apply to the team member
 * @returns Promise with the updated team member data
 */
export const updateTeamMember = async (
  id: string,
  updates: Partial<TeamMember>
): Promise<TeamMember> => {
  try {
    // Verify the current user has permission to update team members
    const hasPermission = await canManageTeam();
    if (!hasPermission) {
      throw new Error("You don't have permission to update team members");
    }

    // Make sure we're not trying to update sensitive fields
    const safeUpdates = {
      ...(updates.name && { name: updates.name }),
      ...(updates.role && { role: updates.role }),
      ...(updates.status && { status: updates.status }),
      updated_at: new Date().toISOString()
    };

    // Perform the update
    const { data, error } = await supabase
      .from('team_members')
      .update(safeUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error("Supabase error updating team member:", error);
      throw error;
    }

    toast.success("Team member updated successfully");
    return data as TeamMember;
  } catch (error) {
    console.error("Error updating team member:", error);
    toast.error(error instanceof Error ? error.message : "Failed to update team member");
    throw error;
  }
};
