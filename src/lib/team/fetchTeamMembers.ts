
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamMemberRole } from "@/types/teamMember";

export const fetchTeamMembers = async () => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error("Supabase error fetching team members:", error);
      throw error;
    }
    
    // Ensure the role property is correctly typed as TeamMemberRole
    return (data || []).map(member => ({
      ...member,
      role: member.role as TeamMemberRole
    })) as TeamMember[];
  } catch (error) {
    console.error("Error fetching team members:", error);
    
    // Check for connection-related errors
    if (error instanceof Error) {
      if (error.message && (
          error.message.includes("Failed to fetch") || 
          error.message.includes("Network request failed") ||
          error.message.includes("NetworkError") ||
          error.message.includes("network") ||
          error.message.includes("timeout") ||
          error.message.includes("connection"))) {
        throw new Error("Connection failed: Unable to reach the database");
      }
    }
    
    throw error;
  }
};
