
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TeamManagementHeader } from "./team/TeamManagementHeader";
import { TeamManagementContent } from "./team/TeamManagementContent";
import { useTeamMembersData } from "./team/hooks/useTeamMembersData";

export const TeamManagementSettings = () => {
  const {
    members,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  } = useTeamMembersData();

  const openInviteDialog = () => {
    // When using InviteTeamMemberDialog directly as button
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <TeamManagementHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInvite={handleAddMember}
        />
      </CardHeader>
      <CardContent>
        <TeamManagementContent
          members={members}
          searchQuery={searchQuery}
          isLoading={isLoading}
          isError={isError}
          onEdit={handleUpdateMember}
          onDelete={handleDeleteMember}
          onInvite={openInviteDialog}
        />
      </CardContent>
    </Card>
  );
};
