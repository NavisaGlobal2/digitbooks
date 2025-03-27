
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";

// Flag to control database connectivity
const OFFLINE_MODE = false;

export const fetchTeamMembers = async () => {
  if (OFFLINE_MODE) {
    console.log("Running in offline mode - returning mock data");
    // Return mock data when in offline mode
    return [
      {
        id: "mock-id-1",
        user_id: "mock-user-id",
        name: "John Doe",
        email: "john@example.com",
        role: "Admin" as TeamMemberRole,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: "mock-id-2",
        user_id: "mock-user-id",
        name: "Jane Smith",
        email: "jane@example.com",
        role: "Member" as TeamMemberRole,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ] as TeamMember[];
  }

  try {
    // This code only runs if OFFLINE_MODE is false
    const { supabase } = await import("@/integrations/supabase/client");
    
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
        toast.error("Running in offline mode due to connection issues");
      }
    }
    
    // Return mock data in case of any error
    return [
      {
        id: "error-fallback-1",
        user_id: "error-user-id",
        name: "Offline User",
        email: "offline@example.com",
        role: "Admin" as TeamMemberRole,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ] as TeamMember[];
  }
};
