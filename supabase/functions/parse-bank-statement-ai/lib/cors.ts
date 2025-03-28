
/**
 * CORS headers for cross-origin requests
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Handle CORS preflight requests
 */
export function handleCorsRequest() {
  return new Response(null, { headers: corsHeaders, status: 204 });
}
