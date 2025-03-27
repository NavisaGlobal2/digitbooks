
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { teamMember, invitedBy } = await req.json();
    console.log("Received invitation request:", { teamMember, invitedBy });

    // Initialize Supabase client with service role key to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );

    // Get application URL for the invitation link
    const appUrl = req.headers.get('origin') || Deno.env.get('APP_URL') || '';
    const inviteLink = `${appUrl}/invitation?token=${encodeURIComponent(teamMember.id)}`;

    // Placeholder for actual email sending
    // In a production environment, you would use a service like SendGrid, Resend, or Mailgun
    console.log("Would send email to:", teamMember.email);
    console.log("Invitation link:", inviteLink);
    console.log("Team Member role:", teamMember.role);

    // For now, let's log what would be sent
    const emailContent = `
      Hello ${teamMember.name},

      You have been invited to join a team as a ${teamMember.role} by ${invitedBy.name || invitedBy.email}.
      
      Click the following link to accept the invitation:
      ${inviteLink}
      
      This invitation will expire in 7 days.
      
      Best regards,
      The Team
    `;

    console.log("Email content:", emailContent);

    // Update the team member status to reflect the invitation was sent
    const { data, error } = await supabaseAdmin
      .from('team_members')
      .update({ status: 'pending' })
      .eq('id', teamMember.id)
      .select();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully", 
        data: data 
      }),
      { 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        } 
      }
    );
  }
});
