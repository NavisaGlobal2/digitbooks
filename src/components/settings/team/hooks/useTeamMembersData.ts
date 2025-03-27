
import { useState, useEffect } from "react";
import { useTeamMembers } from "@/lib/team/useTeamMembers";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

export const useTeamMembersData = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { fetchTeamMembers } = useTeamMembers();

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await fetchTeamMembers();
        
        if (data.length === 0 && user) {
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
          setMembers(data);
        }
      } catch (error) {
        console.error("Error loading team members:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, [fetchTeamMembers, user]);

  const handleAddMember = (newMember: TeamMember) => {
    setMembers([...members, newMember]);
    toast.success(`Invitation sent to ${newMember.email}. They should receive an email shortly.`);
  };

  const handleUpdateMember = (updatedMember: TeamMember) => {
    setMembers(members.map(member => 
      member.id === updatedMember.id ? updatedMember : member
    ));
  };

  const handleDeleteMember = (memberId: string) => {
    setMembers(members.filter(member => member.id !== memberId));
  };

  return {
    members,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  };
};
