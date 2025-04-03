
import { TeamHeaderActions } from "./TeamHeaderActions";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { TeamMemberRole } from "@/types/teamMember";

interface TeamHeaderProps {
  canManage: boolean;
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onAddTeamMember: (name: string, email: string, role: TeamMemberRole) => Promise<{ success: boolean; error?: string }>;
  onInviteTeamMember: (name: string, email: string, role: TeamMemberRole) => Promise<{ success: boolean; error?: string }>;
}

export const TeamHeader = ({
  canManage,
  isAddDialogOpen,
  setIsAddDialogOpen,
  onAddTeamMember,
  onInviteTeamMember
}: TeamHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
        <p className="text-muted-foreground mt-1">
          Manage your team members and their access levels
        </p>
      </div>
      
      {canManage && (
        <div className="flex flex-wrap gap-2">
          <TeamHeaderActions onInvite={onInviteTeamMember} />
          
          <AddTeamMemberDialog 
            open={isAddDialogOpen}
            onOpenChange={setIsAddDialogOpen}
            onAdd={onAddTeamMember}
          />
        </div>
      )}
    </div>
  );
};
