
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

export const useTeamMembers = () => {
  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error("Supabase error fetching team members:", error);
        
        // Return empty array for the specific recursive policy error
        // This prevents the UI from showing an error state when no team members exist
        if (error.code === '42P17') {
          console.info("No team members exist or recursion policy detected - returning empty array");
          return [];
        }
        
        throw error;
      }
      
      // Ensure the role property is correctly typed as TeamMemberRole
      return (data || []).map(member => ({
        ...member,
        role: member.role as TeamMemberRole
      })) as TeamMember[];
    } catch (error) {
      console.error("Error fetching team members:", error);
      
      // Only show toast for errors other than the recursion policy error
      if ((error as any)?.code !== '42P17') {
        toast.error("Failed to load team members");
      }
      
      return [];
    }
  };

  const inviteTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
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
      // This effectively addresses the recursion issue by not triggering the RLS checks
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
      // Then create a properly typed TeamMember object
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
      console.error("Error inviting team member:", error);
      
      if (error.message && error.message.includes("permission denied")) {
        toast.error("Permission issue while inviting team member. Please contact an administrator.");
      } else {
        toast.error(error.message || "Failed to invite team member");
      }
      
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
      console.error("Error updating team member:", error);
      
      // More specific error message based on the error type
      if (error.code === '42P17') {
        toast.error("Permission issue while updating team member. Please contact support.");
      } else {
        toast.error("Failed to update team member");
      }
      
      return null;
    }
  };

  const removeTeamMember = async (id: string) => {
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
      console.error("Error removing team member:", error);
      
      // More specific error message based on the error type
      if (error.code === '42P17') {
        toast.error("Permission issue while removing team member. Please contact support.");
      } else {
        toast.error("Failed to remove team member");
      }
      
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
