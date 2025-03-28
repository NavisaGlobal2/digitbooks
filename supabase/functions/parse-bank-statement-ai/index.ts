
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { processWithAnthropic } from "./lib/anthropicProcessor.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    // Validate that Anthropic API key exists
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase." 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // Parse the request body - this will contain our file
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    
    try {
      // 1. Extract text from the file
      const fileText = await extractTextFromFile(file);
      let transactions = [];
      let usedFallback = false;
      
      try {
        // 2. Try to process with Anthropic
        transactions = await processWithAnthropic(fileText);
      } catch (anthropicError) {
        console.error("Anthropic processing failed:", anthropicError);
        
        // Check if the file is a CSV and we can use fallback parser
        if (file.name.toLowerCase().endsWith('.csv')) {
          console.log("Attempting fallback CSV processing");
          usedFallback = true;
          transactions = await fallbackCSVProcessing(fileText);
          
          if (transactions.length === 0) {
            return new Response(
              JSON.stringify({ 
                error: "Could not parse transactions using either AI or fallback methods. Please check the file format." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
        } else {
          // For non-CSV files, we have to report the error
          return new Response(
            JSON.stringify({ 
              error: `AI processing failed: ${anthropicError.message}. Please try again later or use a CSV file.` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
          );
        }
      }
      
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions,
          message: usedFallback 
            ? `Successfully processed ${transactions.length} transactions using fallback method` 
            : `Successfully processed ${transactions.length} transactions`,
          batchId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      console.error("Processing error:", processingError);
      
      // Check if error is related to Anthropic API key
      const errorMessage = processingError.message || "Unknown processing error";
      if (
        errorMessage.includes("Anthropic API rate limit") || 
        errorMessage.includes("Anthropic") && 
        errorMessage.includes("API key")
      ) {
        return new Response(
          JSON.stringify({ 
            error: "Anthropic API issue: " + errorMessage
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
        );
      }
      
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
