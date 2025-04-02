
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMemberRole } from "@/types/teamMember";
import { z } from "zod";
import { useAuth } from "@/contexts/auth";

interface InviteTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvite: (name: string, email: string, role: TeamMemberRole) => Promise<{ success: boolean; error?: string }>;
}

const inviteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Owner", "Admin", "Member", "Viewer"] as const),
});

export function InviteTeamMemberDialog({ open, onOpenChange, onInvite }: InviteTeamMemberDialogProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMemberRole>("Member");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate inputs
      inviteSchema.parse({ name, email, role });
      
      setIsSubmitting(true);
      
      // Only Owners can invite other Owners or Admins
      // We'll check this both client-side and server-side
      if ((role === "Owner" || role === "Admin") && !isCurrentUserOwner()) {
        setError("Only Owners can invite Owners or Admins");
        setIsSubmitting(false);
        return;
      }
      
      const result = await onInvite(name.trim(), email.trim(), role);
      
      if (!result.success) {
        setError(result.error || "Failed to send invitation");
        return;
      }
      
      // Reset form and close dialog
      setName("");
      setEmail("");
      setRole("Member");
      onOpenChange(false);
    } catch (error) {
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError(error instanceof Error ? error.message : "An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // In a real app, we would check the current user's role from context or state
  // This is a placeholder implementation
  const isCurrentUserOwner = () => {
    // Temporary implementation - replace with actual role check
    return true; // Assume user is Owner for now
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team. They will receive an email with instructions.
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
              placeholder="Enter member's name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="member@example.com"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as TeamMemberRole)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
                <SelectItem value="Member">Member</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <strong>Owner:</strong> Full access to all settings and data. <br />
              <strong>Admin:</strong> Can manage team members and most settings. <br />
              <strong>Member:</strong> Can view and modify financial data. <br />
              <strong>Viewer:</strong> Read-only access to financial data.
            </p>
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
              {isSubmitting ? "Sending..." : "Send invitation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
