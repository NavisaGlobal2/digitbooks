
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { processWithAI } from "./lib/aiService.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";

serve(async (req) => {
  // Log request information
  console.log(`Received ${req.method} request from origin: ${req.headers.get("origin") || "unknown"}`);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    // Parse the request body - this will contain our file
    const formData = await req.formData();
    const file = formData.get("file");
    
    // Get the preferred AI provider from the request, if provided
    const preferredProvider = formData.get("preferredProvider")?.toString() || null;
    
    // Only try to set the environment variable if explicitly provided
    // This avoids the "operation not supported" error for PDF files
    if (preferredProvider) {
      try {
        console.log(`Setting preferred AI provider to: ${preferredProvider}`);
        Deno.env.set("PREFERRED_AI_PROVIDER", preferredProvider);
      } catch (envError) {
        // Log but don't fail if we can't set the environment variable
        console.log(`Could not set preferred AI provider: ${envError.message}`);
        // Continue processing without failing
      }
    }
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    // Extract file type for potential fallback decisions
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Get processing context if provided
    const context = formData.get("context")?.toString() || null;
    if (context) {
      console.log(`Processing context: ${context}`);
    }
    
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    
    try {
      // 1. Extract text from the file
      const fileText = await extractTextFromFile(file);
      let transactions = [];
      let usedFallback = false;
      
      try {
        // 2. Try to process with AI service
        transactions = await processWithAI(fileText, fileType, context);
        
        if (transactions.length === 0) {
          throw new Error("No transactions were extracted by the AI service");
        }
      } catch (aiError) {
        console.error("AI processing failed:", aiError);
        
        // If it's a CSV, try the fallback parser as last resort
        if (fileType === "csv") {
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
          // Check if the error is from Anthropic and DeepSeek is not configured
          const isAnthropicError = aiError.message?.includes("Anthropic") || 
                                   aiError.message?.includes("overloaded");
          const isDeepSeekError = aiError.message?.includes("DeepSeek");
          
          // If both AI services failed, provide a detailed error
          if (isAnthropicError && isDeepSeekError) {
            return new Response(
              JSON.stringify({ 
                error: `Both AI services failed. Please try again later or use a CSV file which can be processed with the fallback parser. Original error: ${aiError.message}` 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
            );
          }
          
          // For non-CSV files with a single AI service failure
          return new Response(
            JSON.stringify({ 
              error: `AI processing failed: ${aiError.message}. Please try again later or use a CSV file.` 
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
      
      return new Response(
        JSON.stringify({ error: processingError.message || "Unknown processing error" }),
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
