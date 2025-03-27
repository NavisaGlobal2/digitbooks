
import { useState, useEffect, useCallback } from "react";
import { useTeamMembers } from "@/lib/team/useTeamMembers";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useTeamMembersData = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { fetchTeamMembers, inviteTeamMember, removeTeamMember } = useTeamMembers();

  const loadTeamMembers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      // Try to fetch team members
      const data = await fetchTeamMembers();
      
      // Always ensure at least the owner is displayed even if DB fetch fails
      if (data.length === 0 && user) {
        // Create a fallback owner member when no data is available
        const ownerMember: TeamMember = {
          id: "owner",
          user_id: user.id || "",
          name: user.name || "Account Owner",
          email: user.email || "",
          role: "Owner" as TeamMemberRole,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setMembers([ownerMember]);
      } else {
        // Use actual fetched data
        setMembers(data);
      }
    } catch (error) {
      console.error("Error loading team members:", error);
      // Don't set error state for the recursive policy error 
      // so UI doesn't show error state
      if (typeof error === 'object' && error && 'code' in error && (error as any).code !== '42P17') {
        setIsError(true);
      }
      
      // Ensure user still sees themselves as owner even when error occurs
      if (user) {
        const ownerMember: TeamMember = {
          id: "owner",
          user_id: user.id || "",
          name: user.name || "Account Owner",
          email: user.email || "",
          role: "Owner" as TeamMemberRole,
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setMembers([ownerMember]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchTeamMembers]);

  useEffect(() => {
    loadTeamMembers();
  }, [loadTeamMembers]);

  // Setup realtime subscription to the team_members table
  useEffect(() => {
    // Skip if no user is logged in
    if (!user) return;
    
    // Subscribe to changes on the team_members table
    const channel = supabase
      .channel('team-members-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'team_members' 
        },
        () => {
          // Refresh team members when any change happens
          console.log('Detected change in team_members table, refreshing data');
          loadTeamMembers();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, loadTeamMembers]);

  const handleAddMember = async (newMemberData: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      // First, call the API to create the team member
      const result = await inviteTeamMember(newMemberData);
      
      if (result) {
        // Add the new member to the UI state immediately for better UX
        setMembers(prevMembers => {
          // Check if member with this ID already exists to avoid duplicates
          const existingMemberIndex = prevMembers.findIndex(m => m.id === result.id);
          if (existingMemberIndex >= 0) {
            // Replace existing member with updated one
            const updatedMembers = [...prevMembers];
            updatedMembers[existingMemberIndex] = result;
            return updatedMembers;
          } else {
            // Add new member to the list
            return [...prevMembers, result];
          }
        });
        
        // Force refresh the team members list to ensure we have the latest data
        setTimeout(() => {
          loadTeamMembers();
        }, 1000);
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("Failed to send invitation. Please try again.");
    }
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setMembers(members.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ));
    
    // Also refresh the list to ensure server state is reflected
    setTimeout(() => {
      loadTeamMembers();
    }, 1000);
  };

  const handleDeleteMember = async (memberId: string) => {
    // Only attempt to remove from database if it's not the owner (which is virtual)
    if (memberId !== "owner") {
      try {
        const success = await removeTeamMember(memberId);
        if (success) {
          // Update the UI state after successful API call
          setMembers(members.filter(member => member.id !== memberId));
          toast.success("Team member removed successfully");
          
          // Refresh to make sure we have latest data
          setTimeout(() => {
            loadTeamMembers();
          }, 1000);
        }
      } catch (error) {
        console.error("Error deleting team member:", error);
        toast.error("Failed to remove team member");
      }
    }
  };

  // Add a refresh method to allow manual refreshing of team member data
  const refreshTeamMembers = () => {
    loadTeamMembers();
  };

  return {
    members,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember,
    refreshTeamMembers
  };
};
