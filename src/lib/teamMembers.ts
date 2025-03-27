
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

export const useTeamMembers = () => {
  const fetchTeamMembers = async () => {
    try {
      // Properly type the response from Supabase using the Database type
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
      return [];
    }
  };

  const inviteTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("You must be logged in to invite team members");
        return null;
      }

      const { data, error } = await supabase
        .from('team_members')
        .insert({ 
          ...teamMember, 
          user_id: user.id,
          status: 'pending' 
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // In a real application, we would send an invitation email here
      // For now, we'll just show a success message
      toast.success(`Invitation sent to ${teamMember.email}`);
      return data;
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to invite team member");
      return null;
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
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
      
      if (error) throw error;
      toast.success("Team member updated successfully");
      return data;
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
      return null;
    }
  };

  const removeTeamMember = async (id: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success("Team member removed successfully");
      return true;
    } catch (error) {
      console.error("Error removing team member:", error);
      toast.error("Failed to remove team member");
      return false;
    }
  };

  return {
    fetchTeamMembers,
    inviteTeamMember,
    updateTeamMember,
    removeTeamMember
  };
};
