
import { TeamMember, TeamMemberRole } from "@/types/teamMember";
import { toast } from "sonner";
import { handleTeamError } from "./teamMemberUtils";

// Flag to control database connectivity - must be the same as in fetchTeamMembers.ts
const OFFLINE_MODE = false;

export const inviteTeamMember = async (teamMember: Omit<TeamMember, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
  if (OFFLINE_MODE) {
    console.log("Running in offline mode - simulating team member invite");
    
    const mockTeamMember = {
      id: `mock-${Date.now()}`,
      user_id: 'offline-user',
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    toast.success(`Invitation sent to ${teamMember.email} (offline mode)`);
    return mockTeamMember;
  }

  try {
    console.log("Attempting to invite team member:", teamMember);
    
    // Use the database function we created
    const { supabase } = await import("@/integrations/supabase/client");
    const { data, error } = await supabase.rpc('create_team_invite', {
      p_name: teamMember.name,
      p_email: teamMember.email,
      p_role: teamMember.role
    });
    
    if (error) {
      console.error("Error inviting team member:", error);
      throw error;
    }
    
    console.log("Invitation created successfully, response:", data);
    
    // Properly handle the response, which should be a JSONB object
    const responseData = data as { id: string; token: string };
    
    if (!responseData || typeof responseData !== 'object' || !responseData.id) {
      console.error("Unexpected response format:", responseData);
      throw new Error("Invalid response format from server");
    }
    
    // Create a properly typed response that matches what we'd expect
    const typedData = {
      id: responseData.id,
      user_id: '', // This will be assigned when the invitation is accepted
      name: teamMember.name,
      email: teamMember.email,
      role: teamMember.role as TeamMemberRole,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as TeamMember;
    
    console.log("Calling edge function to send invitation email...");
    
    // Call the edge function to send the invitation email
    const inviterName = (await supabase.auth.getUser()).data.user?.user_metadata?.name || "Team Admin";
    
    const { error: emailError } = await supabase.functions.invoke("send-team-invitation", {
      body: {
        token: responseData.token,
        email: teamMember.email,
        inviterName,
        role: teamMember.role,
        name: teamMember.name
      }
    });
    
    if (emailError) {
      console.warn("Error sending invitation email:", emailError);
      toast.warning("Invitation created but email could not be sent", {
        description: "The user has been invited, but they may not receive an email notification."
      });
    } else {
      toast.success(`Invitation sent to ${teamMember.email}`);
    }
    
    return typedData;
  } catch (error: any) {
    handleTeamError(error, "Failed to invite team member");
    return null;
  }
};
