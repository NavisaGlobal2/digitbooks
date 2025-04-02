
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMemberRole } from "@/types/teamMember";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

interface AddTeamMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, email: string, role: TeamMemberRole) => Promise<{ success: boolean; error?: string }>;
}

const addTeamMemberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["Owner", "Admin", "Member", "Viewer"] as const),
});

type FormValues = z.infer<typeof addTeamMemberSchema>;

export function AddTeamMemberDialog({ open, onOpenChange, onAdd }: AddTeamMemberDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(addTeamMemberSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Member",
    },
  });

  const handleSubmit = async (values: FormValues) => {
    setError(null);
    
    try {
      setIsSubmitting(true);
      
      const result = await onAdd(values.name.trim(), values.email.trim(), values.role);
      
      if (!result.success) {
        setError(result.error || "Failed to add team member");
        return;
      }
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add a new member to your team. They will receive an invitation email.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-2">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
                {error}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter member's name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="member@example.com"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Owner">Owner</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <div className="text-xs text-muted-foreground mt-1">
                    <strong>Owner:</strong> Full access to all settings and data. <br />
                    <strong>Admin:</strong> Can manage team members and most settings. <br />
                    <strong>Member:</strong> Can view and modify financial data. <br />
                    <strong>Viewer:</strong> Read-only access to financial data.
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                {isSubmitting ? "Adding..." : "Add Team Member"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
