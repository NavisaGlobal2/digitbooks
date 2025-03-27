
import { Input } from "@/components/ui/input";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { TeamMember } from "@/types/teamMember";

interface TeamHeaderActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInvite: (member: TeamMember) => void;
  canInvite?: boolean;
}

export const TeamHeaderActions = ({ 
  searchQuery, 
  onSearchChange, 
  onInvite,
  canInvite = false 
}: TeamHeaderActionsProps) => {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mt-4">
      <Input
        placeholder="Search team members..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full lg:w-72"
      />
      
      {canInvite && (
        <InviteTeamMemberDialog onInvite={onInvite} />
      )}
    </div>
  );
};
