
/**
 * CORS headers for cross-origin requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Max-Age": "86400",
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest() {
  console.log("Handling CORS preflight request with expanded headers");
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}
