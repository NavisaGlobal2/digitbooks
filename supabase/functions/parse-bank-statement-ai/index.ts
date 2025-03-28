
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract text from various file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    // For PDFs, we need to convert them to text
    // This would use a PDF parsing library in a production setting
    // For now, we'll just note that it's a PDF and ask Claude to be smart about it
    return `[THIS IS A PDF FILE: ${file.name}]\n\nPlease extract financial transactions from this PDF bank statement.`;
  } else if (fileType === 'csv') {
    // For CSV, we can read the text directly
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    // For Excel files, we would use a library to extract data
    // Again, for now we'll just note it's an Excel file
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

async function processWithAnthropic(text: string): Promise<any> {
  const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
  if (!ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase.");
  }

  console.log("Sending to Anthropic for processing...");
  
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 4000,
        system: `You are a financial data extraction assistant. Your task is to parse bank statement data from various formats and output a clean JSON array of transactions.
        
        For each transaction, extract:
        - date (in YYYY-MM-DD format)
        - description (the transaction narrative)
        - amount (as a number, negative for debits/expenses)
        - type ("debit" or "credit")
        
        Respond ONLY with a valid JSON array of transactions, with no additional text or explanation.
        Sample format:
        [
          {
            "date": "2023-05-15",
            "description": "GROCERY STORE PURCHASE",
            "amount": -58.97,
            "type": "debit"
          },
          {
            "date": "2023-05-17",
            "description": "SALARY PAYMENT",
            "amount": 1500.00,
            "type": "credit"
          }
        ]`,
        messages: [
          {
            role: "user",
            content: text
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Anthropic API error:", error);
      
      // Handle quota exceeded error specifically
      if (error.error?.type === "authentication_error") {
        throw new Error("Anthropic API authentication error: Please check your API key.");
      }
      
      if (error.error?.type === "rate_limit_error") {
        throw new Error("Anthropic API rate limit exceeded. Please try again later.");
      }
      
      if (error.error?.type === "overloaded_error") {
        throw new Error("Anthropic API is currently overloaded. Please try again in a few minutes.");
      }
      
      throw new Error(`Anthropic API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;
    
    if (!content) {
      throw new Error("No content returned from Anthropic");
    }

    // Parse the JSON response - Anthropic should return only JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing Anthropic response:", content);
      throw new Error("Could not parse transactions from Anthropic response");
    }
  } catch (error) {
    console.error("Error processing with Anthropic:", error);
    throw error;
  }
}

// Fallback method when AI processing fails - basic CSV parsing
async function fallbackCSVProcessing(fileContent: string): Promise<any[]> {
  try {
    console.log("Using fallback CSV processing method...");
    const lines = fileContent.split('\n');
    
    // Skip header row and empty lines
    const dataRows = lines.filter(line => line.trim().length > 0);
    
    if (dataRows.length < 2) {
      throw new Error("Not enough data rows in CSV");
    }
    
    // Try to detect date, description, and amount columns based on common patterns
    const transactions = [];
    
    for (let i = 1; i < dataRows.length; i++) { // Skip header row
      const row = dataRows[i].split(',');
      
      if (row.length < 3) continue; // Skip rows with too few columns
      
      // Simple heuristic - assume first column with date-like format is date
      // column with longest text is description, and column with number-like format is amount
      let dateCol = -1;
      let descCol = -1;
      let amountCol = -1;
      
      // Find potential date column
      for (let j = 0; j < row.length; j++) {
        const cell = row[j].trim();
        if (/\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4}/.test(cell)) {
          dateCol = j;
          break;
        }
      }
      
      // Find description column (longest text)
      let maxLength = 0;
      for (let j = 0; j < row.length; j++) {
        if (j !== dateCol) {
          const cell = row[j].trim();
          if (cell.length > maxLength && !cell.match(/^[-+]?\d+(\.\d+)?$/)) {
            maxLength = cell.length;
            descCol = j;
          }
        }
      }
      
      // Find amount column
      for (let j = 0; j < row.length; j++) {
        if (j !== dateCol && j !== descCol) {
          const cell = row[j].trim().replace(/[,$]/g, '');
          if (cell.match(/^[-+]?\d+(\.\d+)?$/)) {
            amountCol = j;
            break;
          }
        }
      }
      
      // If we found all columns, extract transaction
      if (dateCol !== -1 && descCol !== -1 && amountCol !== -1) {
        const amount = parseFloat(row[amountCol].trim().replace(/[,$]/g, ''));
        transactions.push({
          date: formatDate(row[dateCol].trim()),
          description: row[descCol].trim(),
          amount: amount,
          type: amount < 0 ? "debit" : "credit"
        });
      }
    }
    
    console.log(`Fallback processing extracted ${transactions.length} transactions`);
    return transactions;
  } catch (error) {
    console.error("Error in fallback CSV processing:", error);
    return []; // Return empty array if fallback fails
  }
}

// Helper to standardize date format
function formatDate(dateStr: string): string {
  try {
    // Try to parse the date string in various formats
    let dateParts: number[] = [];
    
    if (dateStr.includes('/')) {
      dateParts = dateStr.split('/').map(p => parseInt(p));
    } else if (dateStr.includes('-')) {
      dateParts = dateStr.split('-').map(p => parseInt(p));
    } else if (dateStr.includes('.')) {
      dateParts = dateStr.split('.').map(p => parseInt(p));
    }
    
    if (dateParts.length !== 3) {
      return dateStr; // Return original if we can't parse
    }
    
    // Determine if format is MM/DD/YYYY or DD/MM/YYYY or YYYY/MM/DD
    let year, month, day;
    
    if (dateParts[0] > 1000) { // YYYY/MM/DD
      year = dateParts[0];
      month = dateParts[1];
      day = dateParts[2];
    } else if (dateParts[2] > 1000) { // MM/DD/YYYY or DD/MM/YYYY
      year = dateParts[2];
      // Heuristic: if first part > 12, it's likely a day
      if (dateParts[0] > 12) {
        day = dateParts[0];
        month = dateParts[1];
      } else {
        // Default to MM/DD/YYYY
        month = dateParts[0];
        day = dateParts[1];
      }
    } else {
      // Just use original string if we can't determine format
      return dateStr;
    }
    
    // Pad month and day with leading zeros if needed
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    
    return `${year}-${monthStr}-${dayStr}`;
  } catch (e) {
    return dateStr; // Return original on any error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
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
