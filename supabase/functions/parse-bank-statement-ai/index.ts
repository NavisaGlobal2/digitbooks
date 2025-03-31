
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { parseExcelDirectly } from "./lib/excelParser.ts";
import { isExcelFile } from "./lib/excelService.ts";
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
      // ALWAYS USE DIRECT EXCEL PARSING: for Excel files
      if (isExcelFile(file)) {
        try {
          console.log('Using direct Excel parsing to preserve exact original data structure');
          const excelData = await parseExcelDirectly(file);
          
          if (excelData && Array.isArray(excelData) && excelData.length > 0) {
            console.log(`Successfully parsed ${excelData.length} transactions directly from Excel, preserving original format`);
            
            // Return the transactions exactly as parsed from Excel without any AI processing
            return new Response(
              JSON.stringify({
                success: true,
                transactions: excelData,
                message: `Successfully processed ${excelData.length} transactions directly from Excel`,
                batchId,
                preservedOriginalFormat: true,
                originalExcelData: true // Flag to indicate this is direct Excel data
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
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
      
      // For CSV files, use the fallback CSV processor directly (no AI)
      if (fileType === "csv") {
        try {
          console.log("Processing CSV file with direct CSV processor");
          // Extract text from the CSV file
          const fileText = await file.text();
          const transactions = await fallbackCSVProcessing(fileText);
          
          if (transactions.length === 0) {
            return new Response(
              JSON.stringify({ 
                error: "Could not parse transactions from CSV file. Please check the file format." 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
            );
          }
          
          console.log(`Parsed ${transactions.length} transactions from CSV file`);
          
          return new Response(
            JSON.stringify({ 
              success: true, 
              transactions,
              message: `Successfully processed ${transactions.length} transactions from CSV file`,
              batchId
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        } catch (csvError) {
          console.error("CSV processing error:", csvError);
          return new Response(
            JSON.stringify({ 
              error: `Failed to process CSV file: ${csvError.message}. Please check the file format.` 
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
          );
        }
      }
      
      // For unsupported file types, return an error
      return new Response(
        JSON.stringify({ 
          error: `Unsupported file type: ${fileType}. Please upload an Excel (.xlsx, .xls) or CSV (.csv) file.` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 415 }
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
