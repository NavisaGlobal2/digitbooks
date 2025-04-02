
import { TeamMember } from "@/types/teamMember";
import { TeamMemberSearch } from "./TeamMemberSearch";
import { TeamMemberList } from "./TeamMemberList";
import { TeamLoadingState } from "./TeamLoadingState";
import { TeamConnectionError } from "./TeamConnectionError";
import { TeamErrorAlert } from "./TeamErrorAlert";
import { User } from "@/contexts/auth/types";

interface TeamContentProps {
  isLoading: boolean;
  error: Error | null;
  teamMembers: TeamMember[];
  filteredMembers: TeamMember[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onRetry: () => void;
  onUpdate: (id: string, updates: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
  onRemove: (id: string) => Promise<{ success: boolean; error?: string }>;
  canManage: boolean;
  user?: User | null;
  onAddDialog: () => void;
}

export const TeamContent = ({
  isLoading,
  error,
  teamMembers,
  filteredMembers,
  searchTerm,
  setSearchTerm,
  onRetry,
  onUpdate,
  onRemove,
  canManage,
  user,
  onAddDialog
}: TeamContentProps) => {
  if (isLoading) {
    return <TeamLoadingState />;
  }

  if (error) {
    return <TeamConnectionError error={error} onRetry={onRetry} />;
  }

  if (teamMembers.length === 0) {
    return (
      <TeamErrorAlert
        title="No team members found"
        description="You haven't added any team members yet. Add team members to collaborate."
        actionLabel={canManage ? "Add Team Member" : undefined}
        onAction={canManage ? onAddDialog : undefined}
      />
    );
  }

  return (
    <>
      <TeamMemberSearch
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        totalCount={teamMembers.length}
        filteredCount={filteredMembers.length}
      />

      <TeamMemberList
        members={filteredMembers}
        onUpdate={onUpdate}
        onRemove={onRemove}
        currentUser={user}
        canManage={canManage}
      />
    </>
  );
};
