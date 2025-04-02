
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TeamMemberRole } from "@/types/teamMember";
import { InviteTeamMemberDialog } from "./InviteTeamMemberDialog";
import { useState } from "react";

interface TeamHeaderActionsProps {
  onInvite: (name: string, email: string, role: TeamMemberRole) => Promise<{ success: boolean; error?: string }>;
}

export const TeamHeaderActions = ({ onInvite }: TeamHeaderActionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Button
        id="invite-team-member-button"
        variant="default"
        className="flex items-center gap-1"
        onClick={handleOpenDialog}
      >
        <Plus className="h-4 w-4" />
        <span>Invite Team Member</span>
      </Button>
      
      <InviteTeamMemberDialog 
        onInvite={onInvite} 
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
};
