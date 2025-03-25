
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if PAYSTACK_SECRET_KEY is set
    if (!PAYSTACK_SECRET_KEY) {
      console.error("Paystack API key is not configured");
      return new Response(
        JSON.stringify({ 
          status: false, 
          message: 'Paystack API key is not configured',
          data: []
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Calling Paystack API to get list of banks");
    
    // Call Paystack API to get list of banks
    const response = await fetch(
      'https://api.paystack.co/bank',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if the response is OK
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Paystack API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ 
          status: false, 
          message: 'Failed to fetch banks from Paystack API', 
          error: errorText,
          data: []
        }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get response data
    const data = await response.json();
    
    console.log(`Received ${data?.data?.length || 0} banks from Paystack API`);
    
    // Return response
    return new Response(
      JSON.stringify(data),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error fetching banks:', error);
    
    return new Response(
      JSON.stringify({ 
        status: false, 
        message: 'An error occurred while fetching banks', 
        error: error.message,
        data: []
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
