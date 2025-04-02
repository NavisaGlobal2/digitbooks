
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";

interface EditTeamMemberDialogProps {
  member: TeamMember;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<TeamMember>) => Promise<{ success: boolean; error?: string }>;
}

export function EditTeamMemberDialog({ member, open, onOpenChange, onUpdate }: EditTeamMemberDialogProps) {
  const [name, setName] = useState(member.name);
  const [role, setRole] = useState<TeamMemberRole>(member.role);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check if the current user is editing themselves
  const isSelf = user?.id === member.user_id;
  
  // Owner should only be editable by another Owner
  const isCurrentUserOwner = member.role === 'Owner';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      // Validation
      if (!name.trim()) {
        setError("Name is required");
        setIsSubmitting(false);
        return;
      }
      
      // Prevent users from changing their own role
      if (isSelf && role !== member.role) {
        setError("You cannot change your own role");
        setIsSubmitting(false);
        return;
      }

      // Only allow changing between Member and Viewer roles
      if (isCurrentUserOwner && role !== member.role) {
        setError("Owner role cannot be changed");
        setIsSubmitting(false);
        return;
      }
      
      const result = await onUpdate(member.id, { 
        name: name.trim(),
        role
      });
      
      if (!result.success) {
        setError(result.error || "Failed to update team member");
        setIsSubmitting(false);
        return;
      }
      
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update team member details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={member.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as TeamMemberRole)}
              disabled={isSelf || isCurrentUserOwner}
            >
              <SelectTrigger id="role" className={isSelf || isCurrentUserOwner ? "bg-muted" : ""}>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {(isSelf || isCurrentUserOwner) && (
              <p className="text-xs text-muted-foreground">
                {isSelf ? "You cannot change your own role" : "Owner role cannot be changed"}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
