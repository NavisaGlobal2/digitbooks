
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTeamMembers } from "@/lib/teamMembers";
import { TeamMember } from "@/types/teamMember";

interface DeleteTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember | null;
  onDelete: (memberId: string) => void;
}

export const DeleteTeamMemberDialog = ({ 
  isOpen, 
  onOpenChange, 
  teamMember, 
  onDelete 
}: DeleteTeamMemberDialogProps) => {
  const { removeTeamMember } = useTeamMembers();

  const handleDeleteMember = async () => {
    if (!teamMember) return;

    const success = await removeTeamMember(teamMember.id);
    if (success) {
      onDelete(teamMember.id);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Team Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {teamMember?.name} from your team? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDeleteMember}
          >
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
