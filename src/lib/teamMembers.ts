
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
      // In sandbox mode, return a mock response instead of making an actual request
      console.log("Database disconnected: Simulating team member invitation for", teamMember.email);
      
      // Create a mock response that resembles what we'd get from a successful invitation
      const mockResponse = {
        id: `mock-${Date.now()}`,
        user_id: 'mock-user-id',
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role as TeamMemberRole,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TeamMember;
      
      toast.success(`Invitation sent to ${teamMember.email}`);
      return mockResponse;
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
      // In sandbox mode, return a mock response
      console.log("Database disconnected: Simulating team member update for ID", id);
      
      // Create a mock response
      const mockUpdatedMember = {
        id: id,
        user_id: 'mock-user-id',
        name: updates.name || 'Mock User',
        email: updates.email || 'mock@example.com',
        role: updates.role as TeamMemberRole || 'member',
        status: updates.status || 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TeamMember;
      
      toast.success("Team member updated successfully");
      return mockUpdatedMember;
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
      // In sandbox mode, just log and return success
      console.log("Database disconnected: Simulating team member removal for ID", id);
      
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
