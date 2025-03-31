
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { parseExcelDirectly } from "./lib/excelParser.ts";
import { isExcelFile } from "./lib/excelService.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";
import { formatTransactionsWithAI } from "./lib/aiService.ts";
import { isCSVFile, CSVService } from "./lib/csvService.ts";

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
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Extract file type for potential fallback decisions
    const fileType = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Get processing context if provided
    const context = formData.get("context")?.toString() || null;
    if (context) {
      console.log(`Processing context: ${context}`);
    }

    // Get preferred AI provider if specified
    const preferredProvider = formData.get("preferredProvider")?.toString() || "anthropic";
    try {
      console.log(`Setting preferred AI provider to: ${preferredProvider}`);
      // You could do additional validation here if needed
    } catch (providerError) {
      console.log(`Could not set preferred AI provider: ${providerError.message}`);
    }
    
    // Use direct formatting option if specified
    const useAIFormatting = formData.get("useAIFormatting")?.toString() === "true";
    console.log(`AI formatting ${useAIFormatting ? 'enabled' : 'disabled'}`);
    
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    
    try {
      let transactions = [];
      let preservedOriginalFormat = false;

      // Process Excel files directly
      if (isExcelFile(file)) {
        try {
          console.log('Using direct Excel parsing to preserve exact original data structure');
          const excelData = await parseExcelDirectly(file);
          
          if (excelData && Array.isArray(excelData) && excelData.length > 0) {
            console.log(`Successfully parsed ${excelData.length} transactions directly from Excel`);
            transactions = excelData;
            preservedOriginalFormat = true;
          } else {
            console.log("Direct Excel parsing returned no transactions");
            return new Response(
              JSON.stringify({ 
                error: "Could not extract transaction data from Excel file. Please check the format." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
        } catch (excelError) {
          console.error("Direct Excel parsing error:", excelError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to parse Excel file: ${excelError.message}. Please check the file format.` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
          );
        }
      }
      // Process CSV files directly 
      else if (isCSVFile(file)) {
        try {
          console.log("Processing CSV file with direct CSV processor");
          // Extract text from the CSV file
          const fileText = await CSVService.extractTextFromCSV(file);
          
          if (!fileText || fileText.trim() === '') {
            console.error("Empty CSV file or text extraction failed");
            return new Response(
              JSON.stringify({ 
                error: "Empty CSV file or text extraction failed. Please check the file." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
          
          console.log(`Extracted ${fileText.length} characters from CSV file`);
          
          transactions = await fallbackCSVProcessing(fileText);
          
          if (!transactions || transactions.length === 0) {
            console.error("No transactions found in CSV file");
            return new Response(
              JSON.stringify({ 
                error: "Could not parse transactions from CSV file. Please check the file format." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
          
          console.log(`Parsed ${transactions.length} transactions from CSV file`);
          preservedOriginalFormat = true;
        } catch (csvError) {
          console.error("CSV processing error:", csvError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to process CSV file: ${csvError.message}. Please check the file format.` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
          );
        }
      } else {
        // For unsupported file types
        return new Response(
          JSON.stringify({ 
            error: `Unsupported file type: ${fileType}. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.` 
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 415 }
        );
      }

      // Apply formatting to standardize the transaction structure if requested
      let formattedTransactions = transactions;
      let formattingApplied = false;
      
      if (useAIFormatting) {
        console.log("Applying AI formatting to standardize transaction structure");
        try {
          const formatted = await formatTransactionsWithAI(transactions, context, preferredProvider);
          if (formatted && formatted.length > 0) {
            formattedTransactions = formatted;
            formattingApplied = true;
            console.log("Successfully applied AI formatting to transactions");
          } else {
            console.log("AI formatting returned no results, using original transactions");
          }
        } catch (formatError) {
          console.error("Error applying AI formatting:", formatError);
          console.log("Using original transactions due to formatting error");
        }
      } else {
        console.log("Skipping AI formatting, returning original transaction structure");
      }
      
      // Return the transactions with metadata
      return new Response(
        JSON.stringify({
          success: true,
          transactions: formattedTransactions,
          message: `Successfully processed ${formattedTransactions.length} transactions`,
          batchId,
          preservedOriginalFormat,
          formattingApplied,
          originalFormat: preservedOriginalFormat && !formattingApplied
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
