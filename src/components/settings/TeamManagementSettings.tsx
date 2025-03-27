
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamMembers } from "@/lib/teamMembers";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";
import { InviteTeamMemberDialog } from "./team/InviteTeamMemberDialog";
import { EditTeamMemberDialog } from "./team/EditTeamMemberDialog";
import { DeleteTeamMemberDialog } from "./team/DeleteTeamMemberDialog";
import { TeamMemberList } from "./team/TeamMemberList";
import { TeamMemberSearch } from "./team/TeamMemberSearch";
import { EmptyState } from "../ui/empty-state";
import { UserPlus } from "lucide-react";
import { toast } from "sonner";

export const TeamManagementSettings = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
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

  const openEditDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsDeleteDialogOpen(true);
  };

  const openInviteDialog = () => {
    // When using InviteTeamMemberDialog directly as button
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your team members and their access levels
        </CardDescription>
        <div className="flex items-center justify-between mt-4">
          <TeamMemberSearch 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          <InviteTeamMemberDialog onInvite={handleAddMember} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : isError ? (
          <EmptyState
            icon={<UserPlus className="h-8 w-8 text-gray-400" />}
            title="Error loading team members"
            description="There was a problem loading your team members. Please try again later."
            primaryAction={{
              label: "Try Again",
              onClick: () => window.location.reload(),
              icon: <div className="mr-2">↻</div>
            }}
          />
        ) : members.length === 0 ? (
          <EmptyState
            icon={<UserPlus className="h-8 w-8 text-gray-400" />}
            title="No team members yet"
            description="Invite your colleagues to collaborate with you"
            primaryAction={{
              label: "Invite Team Member",
              onClick: openInviteDialog,
              icon: <UserPlus className="h-4 w-4 mr-2" />
            }}
          />
        ) : (
          <TeamMemberList
            members={members}
            searchQuery={searchQuery}
            onEdit={openEditDialog}
            onDelete={openDeleteDialog}
          />
        )}

        <EditTeamMemberDialog
          isOpen={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          teamMember={currentMember}
          onUpdate={handleUpdateMember}
        />

        <DeleteTeamMemberDialog
          isOpen={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          teamMember={currentMember}
          onDelete={handleDeleteMember}
        />
      </CardContent>
    </Card>
  );
};
