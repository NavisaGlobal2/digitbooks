
import { useState, useEffect } from "react";
import { useTeamMembers } from "@/lib/teamMembers";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { TeamHeaderActions } from "./TeamHeaderActions";
import { TeamMemberList } from "./TeamMemberList";
import { TeamMemberSearch } from "./TeamMemberSearch";
import { TeamLoadingState } from "./TeamLoadingState";
import { TeamConnectionError } from "./TeamConnectionError";
import { TeamErrorAlert } from "./TeamErrorAlert";
import { canManageTeam } from "@/lib/team/userPermissions";
import { useAuth } from "@/contexts/auth";

export const TeamManagementContainer = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [canManage, setCanManage] = useState(false);
  const { fetchTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember } = useTeamMembers();
  const { user } = useAuth();

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
  }, [user?.id]);

  // Handle search
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

  // Handle invite team member
  const handleInviteTeamMember = async (
    name: string,
    email: string,
    role: TeamMemberRole
  ) => {
    try {
      await inviteTeamMember(name, email, role);
      
      // Refresh team members list after invitation
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

  if (isLoading) {
    return <TeamLoadingState />;
  }

  if (error) {
    return <TeamConnectionError error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their access levels
          </p>
        </div>
        
        {canManage && (
          <TeamHeaderActions onInvite={handleInviteTeamMember} />
        )}
      </div>

      {teamMembers.length > 0 && (
        <>
          <TeamMemberSearch
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            totalCount={teamMembers.length}
            filteredCount={filteredMembers.length}
          />

          <TeamMemberList
            members={filteredMembers}
            onUpdate={handleUpdateTeamMember}
            onRemove={handleRemoveTeamMember}
            currentUser={user}
            canManage={canManage}
          />
        </>
      )}

      {teamMembers.length === 0 && (
        <TeamErrorAlert
          title="No team members found"
          description="You haven't added any team members yet. Invite team members to collaborate."
          actionLabel={canManage ? "Invite Team Member" : undefined}
          onAction={canManage ? () => document.getElementById('invite-team-member-button')?.click() : undefined}
        />
      )}
    </div>
  );
};
