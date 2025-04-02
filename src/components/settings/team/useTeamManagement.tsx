
import { useState, useEffect } from "react";
import { useTeamMembers } from "@/lib/team";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { canManageTeam } from "@/lib/team/userPermissions";
import { useAuth } from "@/contexts/auth";

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canManage, setCanManage] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { fetchTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember, addTeamMember } = useTeamMembers();
  const { user } = useAuth();

  // Load team members
  useEffect(() => {
    const loadTeamMembers = async () => {
      try {
        setIsLoading(true);
        const members = await fetchTeamMembers();
        setTeamMembers(members);
        setFilteredMembers(members);
        
        // Check if current user can manage team
        const hasManagePermission = await canManageTeam(user?.id);
        setCanManage(hasManagePermission);
      } catch (error) {
        console.error("Error loading team members:", error);
        setError(error instanceof Error ? error : new Error("Failed to load team members"));
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, [user?.id, fetchTeamMembers]);

  // Handle search filtering
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredMembers(teamMembers);
      return;
    }

    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = teamMembers.filter(
      (member) =>
        member.name.toLowerCase().includes(lowerCaseSearch) ||
        member.email.toLowerCase().includes(lowerCaseSearch) ||
        member.role.toLowerCase().includes(lowerCaseSearch)
    );

    setFilteredMembers(filtered);
  }, [searchTerm, teamMembers]);

  // Handle add team member
  const handleAddTeamMember = async (
    name: string,
    email: string,
    role: TeamMemberRole
  ) => {
    try {
      await addTeamMember(name, email, role);
      
      // Refresh team members list after adding
      const updatedMembers = await fetchTeamMembers();
      setTeamMembers(updatedMembers);
      setFilteredMembers(
        searchTerm ? 
          updatedMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedMembers
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error adding team member:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to add team member" 
      };
    }
  };

  // Handle invite team member
  const handleInviteTeamMember = async (
    name: string,
    email: string,
    role: TeamMemberRole
  ) => {
    try {
      await inviteTeamMember(name, email, role);
      
      // Refresh team members list after inviting
      const updatedMembers = await fetchTeamMembers();
      setTeamMembers(updatedMembers);
      setFilteredMembers(
        searchTerm ? 
          updatedMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedMembers
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error inviting team member:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to invite team member" 
      };
    }
  };

  // Handle update team member
  const handleUpdateTeamMember = async (
    id: string,
    updates: Partial<TeamMember>
  ) => {
    try {
      await updateTeamMember(id, updates);
      
      // Update local state
      const updatedMembers = teamMembers.map(member =>
        member.id === id ? { ...member, ...updates } : member
      );
      
      setTeamMembers(updatedMembers);
      setFilteredMembers(
        searchTerm ? 
          updatedMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedMembers
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error updating team member:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to update team member" 
      };
    }
  };

  // Handle remove team member
  const handleRemoveTeamMember = async (id: string) => {
    try {
      await removeTeamMember(id);
      
      // Update local state
      const updatedMembers = teamMembers.filter(member => member.id !== id);
      setTeamMembers(updatedMembers);
      setFilteredMembers(
        searchTerm ? 
          updatedMembers.filter(member => 
            member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            member.email.toLowerCase().includes(searchTerm.toLowerCase())
          ) : 
          updatedMembers
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error removing team member:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to remove team member" 
      };
    }
  };

  const handleRetry = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const members = await fetchTeamMembers();
      setTeamMembers(members);
      setFilteredMembers(members);
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to load team members"));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    teamMembers,
    filteredMembers,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    canManage,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleAddTeamMember,
    handleInviteTeamMember,
    handleUpdateTeamMember,
    handleRemoveTeamMember,
    handleRetry,
    user
  };
};
