
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvitationRequest {
  token: string;
  email: string;
  inviterName: string;
  role: string;
  name: string;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const ADMIN_EMAIL = "onifade.john.o@gmail.com"; // The verified email address

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required");
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get invitation data from request
    const { token, email, inviterName, role, name }: InvitationRequest = await req.json();

    if (!token || !email || !inviterName || !role || !name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Generate invitation URL with token
    const invitationUrl = `${req.headers.get("origin") || "https://your-app-url.com"}/accept-invitation?token=${token}`;

    // Call Resend API to send email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DigiBooks <onboarding@resend.dev>", // Using the default verified Resend domain
        to: ADMIN_EMAIL, // Send to the admin's email (which is verified)
        subject: `Team invitation for ${email} to join as ${role}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Team Invitation</h2>
            <p>Hi Admin,</p>
            <p>A new invitation has been created for ${name} (${email}) to join as a <strong>${role}</strong>.</p>
            <p>The invitation was created by ${inviterName}.</p>
            <p>Invitation link: ${invitationUrl}</p>
            <p>Since you're using Resend's free tier, you'll need to manually forward this invitation to ${email}</p>
            <hr>
            <p>Message that would be sent to the user:</p>
            <p>Hi ${name},</p>
            <p>${inviterName} has invited you to join their team on DigiBooks as a <strong>${role}</strong>.</p>
            <p>Click the button below to accept your invitation:</p>
            <a href="${invitationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
            <p>If you can't click the button, copy and paste this URL into your browser:</p>
            <p>${invitationUrl}</p>
            <p>This invitation link will expire in 7 days.</p>
          </div>
        `,
      }),
    });

    const result = await response.json();

    console.log("Email sending result:", result);
    
    if (!response.ok) {
      throw new Error(`Failed to send email: ${JSON.stringify(result)}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation email sent to admin",
        note: "Using Resend's free tier: email will be sent to admin, who must forward it to the actual recipient" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error sending invitation:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to send invitation" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
