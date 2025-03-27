
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, UserPlus, X, Search, Mail, Edit, Trash2, Shield, Users } from "lucide-react";
import { useTeamMembers } from "@/lib/teamMembers";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { useAuth } from "@/contexts/auth";

const inviteFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["Admin", "Member", "Viewer"])
});

type InviteFormValues = z.infer<typeof inviteFormSchema>;

export const TeamManagementSettings = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const { fetchTeamMembers, inviteTeamMember, updateTeamMember, removeTeamMember } = useTeamMembers();

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Member"
    }
  });

  const editForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "Member"
    }
  });

  useEffect(() => {
    const loadTeamMembers = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTeamMembers();
        
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
      } catch (error) {
        console.error("Error loading team members:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTeamMembers();
  }, [fetchTeamMembers, user]);

  const handleInviteMember = async (data: InviteFormValues) => {
    const newMember = {
      name: data.name,
      email: data.email,
      role: data.role as TeamMemberRole,
      status: 'pending' as const
    };

    const result = await inviteTeamMember(newMember);
    if (result) {
      setMembers([...members, result]);
      setIsInviteDialogOpen(false);
      inviteForm.reset();
    }
  };

  const handleEditMember = async (data: InviteFormValues) => {
    if (!currentMember) return;

    const updates = {
      name: data.name,
      email: data.email,
      role: data.role as TeamMemberRole
    };

    const updatedMember = await updateTeamMember(currentMember.id, updates);
    if (updatedMember) {
      setMembers(members.map(member => 
        member.id === updatedMember.id ? updatedMember : member
      ));
      setIsEditDialogOpen(false);
      setCurrentMember(null);
    }
  };

  const handleDeleteMember = async () => {
    if (!currentMember) return;

    const success = await removeTeamMember(currentMember.id);
    if (success) {
      setMembers(members.filter(member => member.id !== currentMember.id));
      setIsDeleteDialogOpen(false);
      setCurrentMember(null);
    }
  };

  const openEditDialog = (member: TeamMember) => {
    setCurrentMember(member);
    editForm.reset({
      name: member.name,
      email: member.email,
      role: member.role === "Owner" ? "Admin" : member.role
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (member: TeamMember) => {
    setCurrentMember(member);
    setIsDeleteDialogOpen(true);
  };

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: TeamMemberRole, status: string) => {
    if (status === 'pending') return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
    
    switch (role) {
      case "Owner":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "Admin":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "Member":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "Viewer":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const getRoleIcon = (role: TeamMemberRole) => {
    switch (role) {
      case "Owner":
        return <Shield className="h-3 w-3 mr-1" />;
      case "Admin":
        return <Shield className="h-3 w-3 mr-1" />;
      case "Member":
        return <User className="h-3 w-3 mr-1" />;
      case "Viewer":
        return <Users className="h-3 w-3 mr-1" />;
      default:
        return <User className="h-3 w-3 mr-1" />;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Team Members</CardTitle>
        <CardDescription>
          Manage your team members and their access levels
        </CardDescription>
        <div className="flex items-center justify-between mt-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Invite Team Member
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Invite a new member to your team. They'll receive an email invitation.
                </DialogDescription>
              </DialogHeader>
              <Form {...inviteForm}>
                <form onSubmit={inviteForm.handleSubmit(handleInviteMember)} className="space-y-4">
                  <FormField
                    control={inviteForm.control}
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
                    control={inviteForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={inviteForm.control}
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
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Send Invitation</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No team members found
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={getRoleBadgeColor(member.role, member.status)}
                      >
                        <div className="flex items-center">
                          {getRoleIcon(member.role)}
                          {member.role}
                          {member.status === 'pending' && " (Pending)"}
                        </div>
                      </Badge>

                      {member.role !== "Owner" && (
                        <>
                          <Dialog
                            open={isEditDialogOpen && currentMember?.id === member.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setCurrentMember(null);
                              }
                              setIsEditDialogOpen(open);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(member)}
                                disabled={member.id === "owner"}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Team Member</DialogTitle>
                                <DialogDescription>
                                  Update team member details and permissions
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...editForm}>
                                <form onSubmit={editForm.handleSubmit(handleEditMember)} className="space-y-4">
                                  <FormField
                                    control={editForm.control}
                                    name="name"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
                                    name="email"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                          <Input type="email" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={editForm.control}
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
                                              <SelectValue />
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
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setIsEditDialogOpen(false);
                                        setCurrentMember(null);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button type="submit">Save Changes</Button>
                                  </DialogFooter>
                                </form>
                              </Form>
                            </DialogContent>
                          </Dialog>

                          <Dialog
                            open={isDeleteDialogOpen && currentMember?.id === member.id}
                            onOpenChange={(open) => {
                              if (!open) {
                                setCurrentMember(null);
                              }
                              setIsDeleteDialogOpen(open);
                            }}
                          >
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                onClick={() => openDeleteDialog(member)}
                                disabled={member.id === "owner"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Remove Team Member</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to remove {member.name} from your team? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter className="pt-4">
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setCurrentMember(null);
                                  }}
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
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};
