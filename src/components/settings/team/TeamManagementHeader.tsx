
import { CardTitle, CardDescription } from "@/components/ui/card";
import { TeamMemberSearch } from "./TeamMemberSearch";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { TeamMember } from "@/types/teamMember";

interface TeamManagementHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onInvite: (member: TeamMember) => void;
}

export const TeamManagementHeader = ({
  searchQuery,
  onSearchChange,
  onInvite
}: TeamManagementHeaderProps) => {
  return (
    <>
      <CardTitle>Team Members</CardTitle>
      <CardDescription>
        Manage your team members and their access levels
      </CardDescription>
      <div className="flex items-center justify-between mt-4">
        <TeamMemberSearch 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
        <InviteTeamMemberDialog onInvite={onInvite} />
      </div>
    </>
  );
};
