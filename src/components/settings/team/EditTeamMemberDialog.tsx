import React, { useEffect } from "react";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useTeamMembers } from "@/lib/teamMembers";

const teamMemberFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Owner", "Admin", "Member", "Viewer"])
});

type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;

interface EditTeamMemberDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  teamMember: TeamMember | null;
  onUpdate: (member: TeamMember) => void;
}

export const EditTeamMemberDialog = ({ 
  isOpen, 
  onOpenChange, 
  teamMember, 
  onUpdate 
}: EditTeamMemberDialogProps) => {
  const { updateTeamMember } = useTeamMembers();
  
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: teamMember?.name || "",
      email: teamMember?.email || "",
      role: (teamMember?.role as TeamMemberRole) || "Member"
    }
  });

  useEffect(() => {
    if (teamMember) {
      form.reset({
        name: teamMember.name,
        email: teamMember.email,
        role: teamMember.role as TeamMemberRole
      });
    }
  }, [teamMember, form]);

  const handleSubmit = async (data: TeamMemberFormValues) => {
    if (!teamMember) return;

    const updatedMember = await updateTeamMember(teamMember.id, {
      name: data.name,
      email: data.email,
      role: data.role as TeamMemberRole
    });

    if (updatedMember) {
      onUpdate(updatedMember);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>
            Update details for this team member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter name" {...field} />
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
                    <Input type="email" placeholder="Enter email" disabled={true} {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Update</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
