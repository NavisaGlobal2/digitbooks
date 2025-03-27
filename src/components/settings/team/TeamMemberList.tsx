
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Mail, Shield, Trash2, User, Users } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

interface TeamMemberListProps {
  members: TeamMember[];
  searchQuery: string;
  onEdit: (member: TeamMember) => void;
  onDelete: (member: TeamMember) => void;
  canManage?: boolean;
}

export const TeamMemberList = ({ 
  members, 
  searchQuery, 
  onEdit, 
  onDelete,
  canManage = false
}: TeamMemberListProps) => {
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

                {canManage && member.role !== "Owner" && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(member)}
                      disabled={member.id === "owner"}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => onDelete(member)}
                      disabled={member.id === "owner"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};
