
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
import { UserPlus, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export const TeamManagementSettings = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const { user } = useAuth();

  const { fetchTeamMembers } = useTeamMembers();

  useEffect(() => {
    // Only attempt to load if we haven't attempted already
    if (!loadAttempted) {
      const loadTeamMembers = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const data = await fetchTeamMembers();
          
          // If this is a new account with no team members, add the current user as Owner
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
          setLoadAttempted(true); // Mark that we've attempted to load
        }
      };

      loadTeamMembers();
    }
  }, [fetchTeamMembers, user, loadAttempted]);

  const handleAddMember = (newMember: TeamMember) => {
    setMembers([...members, newMember]);
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

  const handleRetry = () => {
    setLoadAttempted(false); // Reset the attempt flag to allow retry
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
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              Failed to load team members. There may be an issue with the database connection.
            </AlertDescription>
            <div className="mt-4">
              <button 
                onClick={handleRetry}
                className="bg-destructive/10 hover:bg-destructive/20 text-destructive px-3 py-1 rounded-md text-sm transition-colors"
              >
                Retry
              </button>
            </div>
          </Alert>
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
