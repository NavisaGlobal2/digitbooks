
import { useState } from "react";
import { TeamMember } from "@/types/teamMember";
import { TeamMemberList } from "./TeamMemberList";
import { TeamConnectionError } from "./TeamConnectionError";
import { TeamLoadingState } from "./TeamLoadingState";
import { TeamErrorAlert } from "./TeamErrorAlert";
import { EmptyState } from "../../ui/empty-state";
import { UserPlus } from "lucide-react";

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
    );
  }

  return (
    <TeamMemberList
      members={members}
      searchQuery={searchQuery}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
};
