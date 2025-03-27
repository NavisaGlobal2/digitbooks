
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { Resend } from "npm:resend@2.0.0";

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

    console.log("Team Member role:", teamMember.role);
    console.log("Invitation link:", inviteLink);
    
    // Initialize Resend for email sending
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    
    // Send the actual email
    try {
      const emailResponse = await resend.emails.send({
        from: "DigitBooks <noreply@digitbooks.app>",
        to: teamMember.email,
        subject: `You've been invited to join a team on DigitBooks`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
            <h2 style="color: #05D166;">DigitBooks Team Invitation</h2>
            <p>Hello ${teamMember.name},</p>
            <p>You have been invited to join a team as a <strong>${teamMember.role}</strong> by ${invitedBy.name || invitedBy.email}.</p>
            <p style="margin: 25px 0;">
              <a href="${inviteLink}" style="background-color: #05D166; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Accept Invitation
              </a>
            </p>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #4f46e5;">${inviteLink}</p>
            <p>This invitation will expire in 7 days.</p>
            <p>Best regards,<br/>The DigitBooks Team</p>
          </div>
        `,
      });
      
      console.log("Email sent successfully:", emailResponse);
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      throw new Error(`Failed to send invitation email: ${emailError.message}`);
    }

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
