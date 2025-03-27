
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { handleCorsPreflightRequest } from "./lib/cors.ts";
import { handleRequest } from "./lib/requestHandler.ts";

// Main server entry point
serve(async (req) => {
  // Handle CORS preflight requests
  const corsResponse = handleCorsPreflightRequest(req);
  if (corsResponse) {
    return corsResponse;
  }

  return handleRequest(req);
});
