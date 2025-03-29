
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { extractTextFromFile } from "./lib/textExtractor.ts"
import { processWithAI } from "./lib/aiService.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request with expanded headers");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const origin = req.headers.get("origin");
    console.log(`Received ${req.method} request from origin: ${origin}`);
    
    // Get preferred AI provider if specified
    const formData = await req.formData();
    const file = formData.get("file") as File;
    let preferredProvider = formData.get("preferredProvider") as string;
    const fileTypeHint = formData.get("fileType") as string;
    const extractRealData = formData.get("extractRealData") === "true";
    const enhancedPdfMode = formData.get("enhancedPdfMode") === "true";
    
    // Set preferred provider if specified
    try {
      console.log(`Setting preferred AI provider to: ${preferredProvider}`);
      Deno.env.set("PREFERRED_AI_PROVIDER", preferredProvider);
    } catch (err) {
      console.log(`Could not set preferred AI provider: ${err.message}`);
    }
    
    if (!file) {
      throw new Error("No file uploaded");
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Handle PDF files with special processing
    if (fileTypeHint === "pdf" || file.name.toLowerCase().endsWith('.pdf')) {
      console.log(enhancedPdfMode ? "Processing PDF file with specialized AI handling" : "Processing PDF file with special handling");
      
      try {
        // Extract text from the file - for PDFs this creates a detailed prompt
        const extractedText = await extractTextFromFile(file);
        
        // Additional context for PDF processing
        const options = {
          isSpecialPdfFormat: true,
          fileName: file.name,
          fileSize: file.size,
          extractRealData,
          enhancedPdfMode
        };
        
        // Process with AI
        const transactions = await processWithAI(extractedText, "general", options);
        
        console.log(`Parsed ${transactions.length} transactions from PDF file`);
        
        // Return the processed transactions
        return new Response(
          JSON.stringify({
            success: true,
            transactions,
            message: `Successfully processed ${transactions.length} transactions from PDF`,
            batchId: crypto.randomUUID()
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      } catch (pdfError) {
        console.error("Error processing PDF:", pdfError);
        
        // Create an error object that can be identified as a PDF error
        const errorObj = {
          message: `Failed to process PDF file: ${pdfError.message}`,
          isPdfError: true
        };
        
        return new Response(
          JSON.stringify({
            success: false,
            error: errorObj
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        );
      }
    }
    
    // For non-PDF files, continue with standard processing
    const extractedText = await extractTextFromFile(file);
    
    // Process the text with AI
    const transactions = await processWithAI(extractedText);
    
    console.log(`Parsed ${transactions.length} transactions from file`);
    
    // Return the JSON response
    return new Response(
      JSON.stringify({
        success: true,
        transactions,
        message: `Successfully processed ${transactions.length} transactions`,
        batchId: crypto.randomUUID()
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Processing error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Unknown error occurred"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
