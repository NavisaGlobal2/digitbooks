
export type TeamMemberRole = 'Owner' | 'Admin' | 'Member' | 'Viewer';

export interface TeamMember {
  id: string;
  user_id: string;
  email: string;
  name: string;
  role: TeamMemberRole;
  status: 'active' | 'pending' | 'inactive';
  avatar?: string;
  created_at: string;
  updated_at: string;
}
