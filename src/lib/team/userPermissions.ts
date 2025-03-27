
import { supabase } from "@/integrations/supabase/client";
import { TeamMemberRole } from "@/types/teamMember";

/**
 * Checks if the current user has a specific role or higher
 * The role hierarchy is: Owner > Admin > Member > Viewer
 */
export const hasRole = async (
  requiredRole: TeamMemberRole,
  userId?: string
): Promise<boolean> => {
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  
  if (!currentUserId) return false;
  
  // Get the user's current role
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', currentUserId)
    .single();
  
  if (error || !data) {
    console.error("Error checking user role:", error);
    return false;
  }

  const userRole = data.role as TeamMemberRole;
  
  // Define role hierarchy
  const roleHierarchy: Record<TeamMemberRole, number> = {
    'Owner': 4,
    'Admin': 3,
    'Member': 2,
    'Viewer': 1
  };
  
  // Check if the user's role has enough permissions
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

/**
 * Checks if the current user is an owner or admin
 */
export const isOwnerOrAdmin = async (userId?: string): Promise<boolean> => {
  return hasRole('Admin', userId);
};

/**
 * Checks if the current user can edit team members
 * Only Owners and Admins can edit team members
 */
export const canManageTeam = async (userId?: string): Promise<boolean> => {
  return isOwnerOrAdmin(userId);
};

/**
 * Checks if the current user can delete a team member
 * Only Owners can delete Admins, and only Owners/Admins can delete Members/Viewers
 */
export const canDeleteTeamMember = async (
  memberRole: TeamMemberRole,
  userId?: string
): Promise<boolean> => {
  const currentUserId = userId || (await supabase.auth.getUser()).data.user?.id;
  
  if (!currentUserId) return false;
  
  // Get the user's current role
  const { data, error } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', currentUserId)
    .single();
  
  if (error || !data) return false;
  
  const userRole = data.role as TeamMemberRole;
  
  if (userRole === 'Owner') return true;
  if (userRole === 'Admin' && (memberRole === 'Member' || memberRole === 'Viewer')) return true;
  
  return false;
};
