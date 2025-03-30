
// supabase/functions/ocr-bank-pdf/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Handle CORS preflight
function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  return null;
}

serve(async (req) => {
  console.log("🔁 OCR.space PDF Processing Edge Function is running...");
  
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Parse request body
    const { pdfUrl } = await req.json();
    
    if (!pdfUrl) {
      return new Response(JSON.stringify({ error: 'Missing PDF URL' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Get the OCR.space API key from environment variables
    const ocrSpaceApiKey = Deno.env.get('OCR_SPACE_API_KEY');
    
    if (!ocrSpaceApiKey) {
      console.error("❌ OCR_SPACE_API_KEY environment variable is not set");
      return new Response(JSON.stringify({ 
        error: 'OCR.space API key is not configured on the server',
        details: 'Please set the OCR_SPACE_API_KEY environment variable in your Supabase project settings.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log("🔄 Calling OCR.space API with PDF URL:", pdfUrl);
    
    // Call the OCR.space API
    const ocrResponse = await fetch('https://api.ocr.space/parse/url', {
      method: 'POST',
      headers: {
        'apikey': ocrSpaceApiKey,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'url': pdfUrl,
        'language': 'eng',
        'isTable': 'true',
        'detectOrientation': 'true',
        'scale': 'true',
        'OCREngine': '2' // More accurate OCR engine
      }).toString()
    });
    
    if (!ocrResponse.ok) {
      const errorText = await ocrResponse.text();
      console.error("❌ OCR.space API request failed:", errorText);
      return new Response(JSON.stringify({ 
        error: 'OCR.space API request failed',
        details: errorText 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const ocrResult = await ocrResponse.json();
    
    if (ocrResult.IsErroredOnProcessing) {
      console.error("❌ OCR.space processing error:", ocrResult.ErrorMessage || "Unknown error");
      return new Response(JSON.stringify({ 
        error: 'OCR.space processing error',
        details: ocrResult.ErrorMessage 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract the text from the OCR result
    let extractedText = '';
    if (ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
      extractedText = ocrResult.ParsedResults
        .map((result: any) => result.ParsedText)
        .join('\n');
    }
    
    if (!extractedText) {
      return new Response(JSON.stringify({ 
        error: 'No text could be extracted from the PDF' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    console.log("✅ OCR processing completed successfully");
    
    return new Response(JSON.stringify({ 
      success: true,
      text: extractedText
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    console.error('❌ Error in OCR-bank-pdf edge function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
