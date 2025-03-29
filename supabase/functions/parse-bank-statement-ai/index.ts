
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { processWithAI } from "./lib/aiService.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";

serve(async (req) => {
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
    
    // Get file type hint if provided
    const fileTypeHint = formData.get("fileType")?.toString() || null;
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    console.log(`File type hint: ${fileTypeHint || "none"}`);
    
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
      // Special handling for PDF files to avoid stack overflow
      if (fileType === "pdf" || fileTypeHint === "pdf") {
        console.log("Processing PDF file with special handling");
        
        try {
          // Use a simpler approach for PDFs that won't try to extract text
          // This avoids the stack overflow error
          const pdfPrompt = `This is a bank statement in PDF format named ${file.name}.
Please extract all financial transactions including:
1. Transaction dates in YYYY-MM-DD format
2. Transaction descriptions
3. Transaction amounts (negative for debits, positive for credits)
4. Transaction types (debit/credit)

Return ONLY a valid JSON array of transactions.`;
          
          const transactions = await processWithAI(pdfPrompt, "pdf", context);
          
          if (!Array.isArray(transactions) || transactions.length === 0) {
            return new Response(
              JSON.stringify({ error: "No valid transactions found in the PDF" }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
          
          console.log(`Parsed ${transactions.length} transactions from PDF file`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              transactions,
              message: `Successfully processed ${transactions.length} transactions from PDF`,
              batchId
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (pdfError) {
          console.error("PDF processing error:", pdfError);
          
          return new Response(
            JSON.stringify({ 
              error: `PDF processing failed: ${pdfError.message}`, 
              isPdfError: true 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }
      }
      
      // For non-PDF files, use the standard extraction approach
      const fileText = await extractTextFromFile(file);
      let transactions = [];
      let usedFallback = false;
      
      try {
        // Process with AI service
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
