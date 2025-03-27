
import { corsHeaders } from "./cors.ts";

// Generate a response with proper headers
export function createResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status 
    }
  );
}
