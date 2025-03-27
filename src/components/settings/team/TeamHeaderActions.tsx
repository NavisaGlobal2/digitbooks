
import { TeamMemberSearch } from "./TeamMemberSearch";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { TeamMember } from "@/types/teamMember";

interface TeamHeaderActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInvite: (member: TeamMember) => void;
}

export const TeamHeaderActions = ({
  searchQuery,
  onSearchChange,
  onInvite,
}: TeamHeaderActionsProps) => {
  return (
    <div className="flex items-center justify-between mt-4">
      <TeamMemberSearch 
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
      />
      <InviteTeamMemberDialog onInvite={onInvite} />
    </div>
  );
};
