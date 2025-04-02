
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { TeamMember } from "@/types/teamMember";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Users, WifiOff } from "lucide-react";
import { TeamMemberList } from "./TeamMemberList";
import { TeamLoadingState } from "./TeamLoadingState";
import { TeamConnectionError } from "./TeamConnectionError";
import { TeamErrorAlert } from "./TeamErrorAlert";

interface TeamContentProps {
  isLoading: boolean;
  isError: boolean;
  connectionError: boolean;
  members: TeamMember[];
  searchQuery: string;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  onRetry: () => void;
  openInviteDialog: () => void;
  canManage?: boolean;
}

export const TeamContent = ({
  isLoading,
  isError,
  connectionError,
  members,
  searchQuery,
  onEdit,
  onDelete,
  onRetry,
  openInviteDialog,
  canManage = false
}: TeamContentProps) => {
  if (isLoading) {
    return <TeamLoadingState />;
  }

  if (connectionError) {
    return <TeamConnectionError onRetry={onRetry} />;
  }

  if (isError) {
    return <TeamErrorAlert onRetry={onRetry} />;
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-10">
        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No team members yet</h3>
        <p className="text-muted-foreground mb-6">
          Get started by inviting team members to collaborate
        </p>
        {canManage && (
          <Button onClick={openInviteDialog}>
            Invite Team Member
          </Button>
        )}
      </div>
    );
  }

  // Convert onEdit and onDelete to the format expected by TeamMemberList
  const handleUpdate = async (id: string, updates: Partial<TeamMember>) => {
    const member = members.find(m => m.id === id);
    if (member) {
      onEdit({ ...member, ...updates });
    }
    return { success: true };
  };

  const handleRemove = async (id: string) => {
    const member = members.find(m => m.id === id);
    if (member) {
      onDelete(member);
    }
    return { success: true };
  };

  return (
    <TeamMemberList 
      members={members}
      onUpdate={handleUpdate}
      onRemove={handleRemove}
      canManage={canManage}
    />
  );
};
