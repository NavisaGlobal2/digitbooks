
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from '../lib/cors.ts';
import { createMockFile, generateMockCSV, assert } from './helpers.ts';

// Mock environment variables
const originalEnv = Deno.env;
Deno.env = {
  get: (key: string) => {
    if (key === 'SUPABASE_URL') return 'https://example.com';
    if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-service-key';
    return undefined;
  },
  set: (key: string, value: string) => {},
  delete: (key: string) => {},
  toObject: () => ({
    SUPABASE_URL: 'https://example.com',
    SUPABASE_SERVICE_ROLE_KEY: 'fake-service-key'
  })
};

// Import the main handler function
import { handleRequest } from '../index.ts';

Deno.test("Integration - handles OPTIONS request correctly", async () => {
  const req = new Request('https://example.com', {
    method: 'OPTIONS'
  });
  
  const response = await handleRequest(req);
  
  assert(response.status === 204, "OPTIONS request should return 204 status");
  
  // Check CORS headers
  for (const [key, value] of Object.entries(corsHeaders)) {
    assert(response.headers.get(key) === value, `Should have CORS header: ${key}`);
  }
  
  console.log("Integration OPTIONS test passed!");
});

Deno.test("Integration - handles missing auth header", async () => {
  const req = new Request('https://example.com', {
    method: 'POST'
  });
  
  const response = await handleRequest(req);
  assert(response.status === 401, "Should return 401 for missing auth header");
  
  const responseData = await response.json();
  assert(responseData.error === 'Missing Authorization header', "Should have correct error message");
  
  console.log("Integration auth handling test passed!");
});

// Restore original Deno.env
Deno.env = originalEnv;
