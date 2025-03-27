
import { useState } from "react";
import { TeamMemberList } from "./TeamMemberList";
import { EditTeamMemberDialog } from "./EditTeamMemberDialog";
import { DeleteTeamMemberDialog } from "./DeleteTeamMemberDialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { RefreshCw, UserPlus } from "lucide-react";
import { TeamMember } from "@/types/teamMember";

interface TeamManagementContentProps {
  members: TeamMember[];
  searchQuery: string;
  isLoading: boolean;
  isError: boolean;
  onEdit: (member: TeamMember) => void;
  onDelete: (memberId: string) => void;
  onInvite?: () => void;
  onRefresh?: () => void;
}

export const TeamManagementContent = ({
  members,
  searchQuery,
  isLoading,
  isError,
  onEdit,
  onDelete,
  onInvite,
  onRefresh
}: TeamManagementContentProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);

  const openEditDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={<UserPlus className="h-8 w-8 text-gray-400" />}
        title="Error loading team members"
        description="There was a problem loading your team members. Please try again later."
        primaryAction={{
          label: "Try Again",
          onClick: onRefresh || (() => window.location.reload()),
          icon: <div className="mr-2">↻</div>
        }}
      />
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh} className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
      
      {members.length === 0 ? (
        <EmptyState
          icon={<UserPlus className="h-8 w-8 text-gray-400" />}
          title="No team members yet"
          description="Invite your colleagues to collaborate with you"
          primaryAction={{
            label: "Invite Team Member",
            onClick: onInvite,
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
        onUpdate={onEdit}
      />

      <DeleteTeamMemberDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        teamMember={currentMember}
        onDelete={() => currentMember && onDelete(currentMember.id)}
      />
    </>
  );
};
