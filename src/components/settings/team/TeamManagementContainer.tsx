import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTeamMembers } from "@/lib/teamMembers";
import { TeamMember } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";
import { EditTeamMemberDialog } from "./EditTeamMemberDialog";
import { DeleteTeamMemberDialog } from "./DeleteTeamMemberDialog";
import { TeamHeaderActions } from "./TeamHeaderActions";
import { TeamContent } from "./TeamContent";

export const TeamManagementContainer = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [loadAttempted, setLoadAttempted] = useState(false);
  const { user } = useAuth();

  const { fetchTeamMembers } = useTeamMembers();

  useEffect(() => {
    console.log("TeamManagementContainer mounting, fetching team members soon");
    if (!loadAttempted) {
      console.log("Attempting to load team members");
      loadTeamMembers();
    }
  }, [loadAttempted]);

  const loadTeamMembers = async () => {
    console.log("loadTeamMembers function called");
    setIsLoading(true);
    setIsError(false);
    setConnectionError(false);
    
    try {
      console.log("Fetching team members...");
      const data = await fetchTeamMembers();
      console.log("Team members fetched successfully:", data);
      
      // If this is a new account with no team members, add the current user as Owner
      if (data.length === 0 && user) {
        const ownerMember: TeamMember = {
          id: "owner",
          user_id: user.id || "",
          name: user.name || "Account Owner",
          email: user.email || "",
          role: "Owner",
          status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setMembers([ownerMember]);
      } else {
        setMembers(data);
      }
    } catch (error: any) {
      console.error("Error loading team members:", error);
      
      // Check if it's a connection error (fetch failed)
      if (error.message && (
          error.message.includes("Failed to fetch") || 
          error.message.includes("NetworkError") ||
          error.message.includes("Network request failed") ||
          error.message.includes("Connection failed"))) {
        setConnectionError(true);
        toast.error("Database connection failed", {
          description: "Please check your internet connection and try again"
        });
      } else {
        setIsError(true);
      }
    } finally {
      setIsLoading(false);
      setLoadAttempted(true);
      console.log("Team members loading complete");
    }
  };

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
        <CardTitle>Team Members (Offline Mode)</CardTitle>
        <CardDescription>
          Managing your team members in offline mode - database connections disabled
        </CardDescription>
        <TeamHeaderActions 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInvite={handleAddMember}
        />
      </CardHeader>
      <CardContent>
        <TeamContent 
          isLoading={isLoading}
          isError={isError}
          connectionError={connectionError}
          members={members}
          searchQuery={searchQuery}
          onEdit={openEditDialog}
          onDelete={openDeleteDialog}
          onRetry={handleRetry}
          openInviteDialog={openInviteDialog}
        />

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
