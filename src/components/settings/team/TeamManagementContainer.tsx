
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
import { canManageTeam, canDeleteTeamMember } from "@/lib/team/userPermissions";

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
  const [canManage, setCanManage] = useState(false);
  const { user } = useAuth();

  const { fetchTeamMembers } = useTeamMembers();

  useEffect(() => {
    console.log("TeamManagementContainer mounting, fetching team members soon");
    if (!loadAttempted) {
      console.log("Attempting to load team members");
      loadTeamMembers();
      checkPermissions();
    }
  }, [loadAttempted]);

  const checkPermissions = async () => {
    const hasPermission = await canManageTeam();
    setCanManage(hasPermission);
  };

  const loadTeamMembers = async () => {
    console.log("loadTeamMembers function called");
    setIsLoading(true);
    setIsError(false);
    setConnectionError(false);
    
    try {
      console.log("Fetching team members...");
      const data = await fetchTeamMembers();
      console.log("Team members fetched successfully:", data);
      
      if (data.length === 0 && user) {
        try {
          console.log("No team members found. Creating owner record for current user:", user);
          
          const { supabase } = await import("@/integrations/supabase/client");
          
          // First, let's directly create the team_member record with owner role
          const { data: newMember, error } = await supabase
            .from('team_members')
            .insert({
              user_id: user.id,
              name: user.name || user.email?.split('@')[0] || "Account Owner",
              email: user.email,
              role: "Owner",
              status: "active"
            })
            .select()
            .single();
          
          if (error) {
            console.error("Error creating owner team member:", error);
            
            // Fallback approach if the direct insert fails
            const { data: fallbackMember, error: fallbackError } = await supabase
              .rpc('insert_team_member', {
                p_name: user.name || user.email?.split('@')[0] || "Account Owner",
                p_email: user.email || "",
                p_role: "Owner",
                p_status: "active",
                p_user_id: user.id
              });
            
            if (fallbackError) {
              console.error("Fallback also failed:", fallbackError);
              toast.error("Failed to set up team ownership");
              setMembers([]);
            } else {
              console.log("Created owner team member via RPC:", fallbackMember);
              
              // Refresh the team members list to include the newly created member
              const updatedData = await fetchTeamMembers();
              setMembers(updatedData);
              toast.success("You've been set as the team owner");
            }
          } else {
            console.log("Created owner team member:", newMember);
            toast.success("You've been set as the team owner");
            setMembers([newMember as TeamMember]);
          }
        } catch (createError) {
          console.error("Error in owner creation process:", createError);
          const ownerMember: TeamMember = {
            id: "owner-temp",
            user_id: user.id || "",
            name: user.name || "Account Owner",
            email: user.email || "",
            role: "Owner",
            status: "active",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          setMembers([ownerMember]);
        }
      } else {
        setMembers(data);
      }
    } catch (error: any) {
      console.error("Error loading team members:", error);
      
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

  const openEditDialog = async (member: TeamMember) => {
    const canEdit = await canManageTeam();
    
    if (!canEdit) {
      toast.error("You don't have permission to edit team members");
      return;
    }
    
    setCurrentMember(member);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = async (member: TeamMember) => {
    const canDelete = await canDeleteTeamMember(member.role);
    
    if (!canDelete) {
      toast.error(`You don't have permission to delete ${member.role.toLowerCase()} team members`);
      return;
    }
    
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
          Manage your team members and their permissions
        </CardDescription>
        <TeamHeaderActions 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onInvite={handleAddMember}
          canInvite={canManage}
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
          canManage={canManage}
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
