
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { parseExcelDirectly } from "./lib/excelParser.ts";
import { isExcelFile } from "./lib/excelService.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";
import { formatTransactionsWithAI } from "./lib/aiService.ts";
import { isCSVFile, CSVService } from "./lib/csvService.ts";
import { parseCSVDirectly } from "./lib/csvParser.ts";

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB file size limit

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
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 413 }
      );
    }
    
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
      
      // For large files, set a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Processing timeout - file is too complex")), 25000);
      });

      // Process Excel files directly
      if (isExcelFile(file)) {
        try {
          console.log('Using direct Excel parsing to preserve exact original data structure');
          
          const processPromise = parseExcelDirectly(file);
          const excelData = await Promise.race([processPromise, timeoutPromise]);
          
          if (excelData && Array.isArray(excelData) && excelData.length > 0) {
            // Trim down to first 1000 rows maximum to prevent processing errors
            const trimmedData = excelData.slice(0, 1000);
            console.log(`Successfully parsed ${trimmedData.length} transactions directly from Excel${excelData.length > 1000 ? ' (limited from ' + excelData.length + ')' : ''}`);
            console.log(`Sample excel transaction: ${JSON.stringify(trimmedData[0], null, 2).substring(0, 300)}...`);
            transactions = trimmedData;
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
              error: `Failed to parse Excel file: ${excelError.message}. Please check the file format or try with a smaller file.` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
          );
        }
      }
      // Process CSV files directly - using direct parser only, no fallback
      else if (isCSVFile(file)) {
        try {
          console.log("Processing CSV file with direct CSV parser");
          // Use direct parsing similar to Excel
          const processPromise = parseCSVDirectly(file);
          const csvData = await Promise.race([processPromise, timeoutPromise]);
          
          if (csvData && Array.isArray(csvData) && csvData.length > 0) {
            // Trim down to first 1000 rows maximum to prevent processing errors
            const trimmedData = csvData.slice(0, 1000);
            console.log(`Successfully parsed ${trimmedData.length} transactions directly from CSV${csvData.length > 1000 ? ' (limited from ' + csvData.length + ')' : ''}`);
            console.log(`Sample CSV transaction: ${JSON.stringify(trimmedData[0], null, 2).substring(0, 300)}...`);
            transactions = trimmedData;
            preservedOriginalFormat = true;
          } else {
            console.log("Direct CSV parsing returned no transactions");
            return new Response(
              JSON.stringify({ 
                error: "Could not extract transaction data from CSV file. Please check the format." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
        } catch (csvError) {
          console.error("CSV direct processing error:", csvError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to process CSV file: ${csvError.message}. Please check the file format or try with a smaller file.` 
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
      
      if (useAIFormatting && transactions.length > 0) {
        console.log("Applying AI formatting to standardize transaction structure");
        try {
          const aiPromise = formatTransactionsWithAI(transactions, context, preferredProvider);
          const formatted = await Promise.race([aiPromise, timeoutPromise]);
          
          if (formatted && Array.isArray(formatted) && formatted.length > 0) {
            console.log(`AI formatting returned ${formatted.length} transactions`);
            console.log(`Sample AI-formatted transaction: ${JSON.stringify(formatted[0], null, 2).substring(0, 300)}...`);
            
            // Make sure each transaction has an id
            formattedTransactions = formatted.map((tx, idx) => ({
              ...tx,
              id: tx.id || `formatted-tx-${idx}`
            }));
            
            formattingApplied = true;
            console.log("Successfully applied AI formatting to transactions");
          } else {
            console.log("AI formatting returned no results or empty array, using original transactions");
          }
        } catch (formatError) {
          console.error("Error applying AI formatting:", formatError);
          console.log("Using original transactions due to formatting error");
          // We'll continue with the original transactions
        }
      } else {
        console.log("Skipping AI formatting, returning original transaction structure");
      }
      
      // Return the transactions with metadata
      return new Response(
        JSON.stringify({
          success: true,
          transactions: formattedTransactions,
          count: formattedTransactions.length,
          message: `Successfully processed ${formattedTransactions.length} transactions`,
          batchId,
          preservedOriginalFormat,
          formattingApplied,
          originalFormat: preservedOriginalFormat && !formattingApplied,
          fileDetails: {
            name: file.name,
            size: file.size,
            type: file.type
          }
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
