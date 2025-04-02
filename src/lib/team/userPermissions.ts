
import { supabase } from "@/integrations/supabase/client";

/**
 * Check if the current user has permission to manage team members
 * @param userId Optional user ID to check permissions for (defaults to current user)
 * @returns Promise resolving to boolean indicating if user can manage team
 */
export const canManageTeam = async (userId?: string): Promise<boolean> => {
  try {
    // If running in development mode, allow all permissions
    if (import.meta.env.DEV) {
      return true;
    }

    // Get current user if userId not provided
    let userToCheck = userId;
    
    if (!userToCheck) {
      const { data } = await supabase.auth.getUser();
      userToCheck = data.user?.id;
    }
    
    if (!userToCheck) {
      return false;
    }
    
    // Query team_members table to check user's role
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('user_id', userToCheck)
      .single();
    
    if (error || !data) {
      console.error("Error checking user permissions:", error);
      return false;
    }
    
    // Users with Owner or Admin roles can manage team
    return ['Owner', 'Admin'].includes(data.role);
    
  } catch (error) {
    console.error("Error in canManageTeam:", error);
    return false;
  }
};
