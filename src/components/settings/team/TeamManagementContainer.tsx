
import { useTeamManagement } from "./useTeamManagement";
import { TeamHeader } from "./TeamHeader";
import { TeamContent } from "./TeamContent";

export const TeamManagementContainer = () => {
  const {
    teamMembers,
    filteredMembers,
    searchTerm,
    setSearchTerm,
    isLoading,
    error,
    canManage,
    isAddDialogOpen,
    setIsAddDialogOpen,
    handleAddTeamMember,
    handleInviteTeamMember,
    handleUpdateTeamMember,
    handleRemoveTeamMember,
    handleRetry,
    user
  } = useTeamManagement();

  return (
    <div className="space-y-6">
      <TeamHeader 
        canManage={canManage}
        isAddDialogOpen={isAddDialogOpen}
        setIsAddDialogOpen={setIsAddDialogOpen}
        onAddTeamMember={handleAddTeamMember}
        onInviteTeamMember={handleInviteTeamMember}
      />

      <TeamContent 
        isLoading={isLoading}
        error={error}
        teamMembers={teamMembers}
        filteredMembers={filteredMembers}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onRetry={handleRetry}
        onUpdate={handleUpdateTeamMember}
        onRemove={handleRemoveTeamMember}
        canManage={canManage}
        user={user}
        onAddDialog={() => setIsAddDialogOpen(true)}
      />
    </div>
  );
};
