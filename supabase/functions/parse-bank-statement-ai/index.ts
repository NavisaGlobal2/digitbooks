
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { processWithDeepseek } from "./lib/deepseekProcessor.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { processWithAnthropic } from "./lib/anthropicProcessor.ts";

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
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get the authorization token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify auth token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    let bodyData;
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      bodyData = await req.json();
      
      // Handle file path based processing
      if (bodyData.filePath) {
        return await processFileFromStorage(bodyData, user.id, supabase, corsHeaders);
      }
    } else if (contentType.includes('multipart/form-data')) {
      return await processFormDataRequest(req, user.id, supabase, corsHeaders);
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported content type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function processFileFromStorage(bodyData: any, userId: string, supabase: any, corsHeaders: any) {
  try {
    const { filePath, fileName, context = 'general', jobId, processingMode = 'standard', fileType } = bodyData;
    
    // Get the file from storage
    const { data: fileData, error: fileError } = await supabase.storage
      .from('revenue_imports')
      .download(filePath);
      
    if (fileError || !fileData) {
      return new Response(JSON.stringify({ error: 'File not found in storage' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Extract text from file
    const fileExt = fileName.split('.').pop()?.toLowerCase();
    const isPdf = fileExt === 'pdf';
    
    console.log(`Processing ${isPdf ? 'PDF' : fileExt} file with ${context === 'revenue' ? 'revenue' : 'general'} context in ${processingMode} mode`);
    
    // Process the file based on context
    let transactions = [];
    const fileBlob = new Blob([fileData]);
    const file = new File([fileBlob], fileName, { type: isPdf ? 'application/pdf' : 'text/csv' });
    
    // Extract text from the file
    const extractedText = await extractTextFromFile(file);
    
    // Log some details about the extracted text for debugging
    if (isPdf) {
      console.log(`Extracted text from PDF (first 100 chars): ${extractedText.substring(0, 100)}...`);
    }
    
    // Process the text based on preferred provider
    let preferredProvider = 'anthropic'; // Default to Anthropic for PDFs
    
    try {
      // Try Anthropic first (better for PDF extraction)
      console.log("Processing with Anthropic...");
      transactions = await processWithAnthropic(extractedText, context);
      console.log(`Parsed ${transactions.length} transactions from ${isPdf ? 'PDF' : fileExt} file with Anthropic`);
    } catch (anthropicError) {
      console.error('Anthropic processing error:', anthropicError);
      
      // Fallback to DeepSeek
      try {
        console.log("Falling back to DeepSeek...");
        transactions = await processWithDeepseek(extractedText, context);
        console.log(`Fallback: Parsed ${transactions.length} transactions using DeepSeek`);
      } catch (deepseekError) {
        console.error('DeepSeek processing error:', deepseekError);
        throw new Error('Both AI processing services failed');
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      transactions,
      batchId: jobId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing file from storage:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to process file' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function processFormDataRequest(req: Request, userId: string, supabase: any, corsHeaders: any) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const context = formData.get('context') as string || 'general';
    const isRealData = formData.get('isRealData') as string === 'true';
    
    if (!file) {
      return new Response(JSON.stringify({ error: 'No file provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Process the file based on type
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const isPdf = fileExt === 'pdf';
    
    // Extract text from the file
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}, isRealData: ${isRealData}`);
    
    if (isPdf) {
      console.log(`Processing PDF file with ${context === 'revenue' ? 'revenue' : 'general'} context`);
    }
    
    const extractedText = await extractTextFromFile(file);
    
    // Set preferred AI provider
    const preferredProvider = formData.get('preferredProvider') as string || 'anthropic';
    let transactions = [];

    try {
      // Available AI providers
      console.log('Available providers: Anthropic, DeepSeek');
      console.log(`AI processing: using ${preferredProvider} as preferred provider`);
      
      if (preferredProvider === 'deepseek') {
        transactions = await processWithDeepseek(extractedText, context);
      } else {
        // Default to Anthropic
        console.log('Sending to Anthropic for processing...');
        console.log('Processing context:', context);
        transactions = await processWithAnthropic(extractedText, context);
      }
      
      console.log(`Parsed ${transactions.length} transactions from ${isPdf ? 'PDF' : fileExt} file`);
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      
      // Try fallback provider
      try {
        const fallbackProvider = preferredProvider === 'anthropic' ? 'deepseek' : 'anthropic';
        console.log(`Falling back to ${fallbackProvider} for processing`);
        
        if (fallbackProvider === 'deepseek') {
          transactions = await processWithDeepseek(extractedText, context);
        } else {
          transactions = await processWithAnthropic(extractedText, context);
        }
        
        console.log(`Fallback provider parsed ${transactions.length} transactions`);
      } catch (fallbackError) {
        console.error('Fallback provider error:', fallbackError);
        throw new Error('All AI processing services failed');
      }
    }
    
    // Generate a batch ID
    const batchId = crypto.randomUUID();
    
    return new Response(JSON.stringify({ 
      success: true,
      transactions,
      batchId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error processing form data request:', error);
    return new Response(JSON.stringify({ error: error.message || 'Failed to process file' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}
