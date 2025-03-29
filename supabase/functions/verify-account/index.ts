
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request with expanded headers");
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    // Get request data
    let accountNumber, bankCode;
    
    try {
      const requestData = await req.json();
      accountNumber = requestData.accountNumber;
      bankCode = requestData.bankCode;
      console.log(`Request data: Account number: ${accountNumber}, Bank code: ${bankCode}`);
    } catch (e) {
      console.error('Error parsing request JSON:', e);
      return new Response(
        JSON.stringify({ error: 'Invalid request format', details: e.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!accountNumber || !bankCode) {
      console.error(`Missing required fields: Account number: ${!!accountNumber}, Bank code: ${!!bankCode}`);
      return new Response(
        JSON.stringify({ error: 'Account number and bank code are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if PAYSTACK_SECRET_KEY is set
    if (!PAYSTACK_SECRET_KEY) {
      console.error("Paystack API key is not configured");
      return new Response(
        JSON.stringify({ error: 'Paystack API key is not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Calling Paystack API to verify account: ${accountNumber} with bank code: ${bankCode}`);
    
    // Call Paystack API to verify account
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Get response data
    const data = await response.json();
    
    console.log("Paystack verification response:", JSON.stringify(data));
    
    // Return response
    return new Response(
      JSON.stringify(data),
      { 
        status: response.status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error verifying account:', error);
    
    return new Response(
      JSON.stringify({ error: 'An error occurred during verification', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
