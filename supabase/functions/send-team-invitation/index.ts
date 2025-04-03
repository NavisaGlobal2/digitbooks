
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.14.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
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
    console.log("Handling CORS preflight request with expanded headers");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    const ADMIN_EMAIL = "onifade.john.o@gmail.com"; // The verified email address
    const USE_VERIFIED_DOMAIN = Deno.env.get("USE_VERIFIED_DOMAIN") === "true" || false;

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

    // HTML template for the invitation email
    const invitationEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Invitation</h2>
        <p>Hi ${name},</p>
        <p>${inviterName} has invited you to join their team on DigiBooks as a <strong>${role}</strong>.</p>
        <p>Click the button below to accept your invitation:</p>
        <a href="${invitationUrl}" style="display: inline-block; background-color: #4f46e5; color: white; font-weight: bold; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 16px 0;">Accept Invitation</a>
        <p>If you can't click the button, copy and paste this URL into your browser:</p>
        <p>${invitationUrl}</p>
        <p>This invitation link will expire in 7 days.</p>
      </div>
    `;

    // Admin notification email HTML
    const adminEmailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Team Invitation</h2>
        <p>Hi Admin,</p>
        <p>A new invitation has been created for ${name} (${email}) to join as a <strong>${role}</strong>.</p>
        <p>The invitation was created by ${inviterName}.</p>
        <p>Invitation link: ${invitationUrl}</p>
        <p>Since you're using Resend's free tier without a verified domain, you'll need to manually forward this invitation to ${email}</p>
        <hr>
        <p>Message that would be sent to the user:</p>
        ${invitationEmailHtml}
      </div>
    `;

    // Determine if we can send directly to the recipient or need to use admin email
    // This depends on whether you have verified your domain in Resend
    const recipient = USE_VERIFIED_DOMAIN ? email : ADMIN_EMAIL;
    const emailHtml = USE_VERIFIED_DOMAIN ? invitationEmailHtml : adminEmailHtml;
    const emailSubject = USE_VERIFIED_DOMAIN 
      ? `Team invitation to join as ${role}` 
      : `Team invitation for ${email} to join as ${role}`;

    // Call Resend API to send email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "DigiBooks <onboarding@resend.dev>", // Using the default verified Resend domain
        to: recipient,
        subject: emailSubject,
        html: emailHtml,
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
        message: USE_VERIFIED_DOMAIN 
          ? "Invitation email sent directly to recipient" 
          : "Invitation email sent to admin",
        note: USE_VERIFIED_DOMAIN 
          ? "Email sent directly to recipient using verified domain" 
          : "Using Resend's free tier without verified domain: email sent to admin, who must forward it to the actual recipient" 
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
