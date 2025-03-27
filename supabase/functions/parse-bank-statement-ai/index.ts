
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// CORS headers for cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Extract text from various file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.name.split('.').pop()?.toLowerCase();
  
  if (fileType === 'pdf') {
    return `[THIS IS A PDF FILE: ${file.name}]\n\nPlease extract financial transactions from this PDF bank statement.`;
  } else if (fileType === 'csv') {
    return await file.text();
  } else if (fileType === 'xlsx' || fileType === 'xls') {
    return `[THIS IS AN EXCEL FILE: ${file.name}]\n\nPlease extract financial transactions from this Excel bank statement.`;
  } else {
    throw new Error(`Unsupported file type: ${fileType}`);
  }
}

// Process the extracted text with Anthropic API
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
      return handleAnthropicError(response);
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

// Handle specific Anthropic API errors
async function handleAnthropicError(response: Response): Promise<never> {
  const error = await response.json();
  console.error("Anthropic API error:", error);
  
  // Handle quota exceeded error specifically
  if (error.error?.type === "authentication_error") {
    throw new Error("Anthropic API authentication error: Please check your API key.");
  }
  
  if (error.error?.type === "rate_limit_error") {
    throw new Error("Anthropic API rate limit exceeded. Please try again later.");
  }
  
  throw new Error(`Anthropic API error: ${error.error?.message || "Unknown error"}`);
}

// Validate the received file
function validateFile(file: File | null): void {
  if (!file) {
    throw new Error("No file uploaded");
  }
  
  // Check file type
  const fileExt = file.name.split('.').pop()?.toLowerCase();
  if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
    throw new Error("Unsupported file format. Please upload CSV, Excel, or PDF files only.");
  }
  
  // Check file size
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File is too large. Maximum file size is 10MB.");
  }
}

// Generate a response with proper headers
function createResponse(data: any, status = 200): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status 
    }
  );
}

// Main request handler
async function handleRequest(req: Request): Promise<Response> {
  try {
    // Validate that Anthropic API key exists
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) {
      return createResponse({ 
        error: "ANTHROPIC_API_KEY is not configured. Please set up your Anthropic API key in Supabase." 
      }, 500);
    }

    // Parse the request body - this will contain our file
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return createResponse({ error: "No file uploaded" }, 400);
    }
    
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
    
    try {
      // Validate the file
      validateFile(file);
      
      // Generate batch ID for tracking
      const batchId = crypto.randomUUID();
      
      // Extract text from the file
      const fileText = await extractTextFromFile(file);
      
      // Process with Anthropic
      const transactions = await processWithAnthropic(fileText);
      
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      return createResponse({ 
        success: true, 
        transactions,
        message: `Successfully processed ${transactions.length} transactions`, 
        batchId
      });
    } catch (processingError) {
      console.error("Processing error:", processingError);
      
      // Check if error is related to Anthropic API key
      const errorMessage = processingError.message || "Unknown processing error";
      if (
        errorMessage.includes("Anthropic API rate limit") || 
        errorMessage.includes("Anthropic") && 
        errorMessage.includes("API key")
      ) {
        return createResponse({ 
          error: "Anthropic API key issue: " + errorMessage
        }, 500);
      }
      
      return createResponse({ error: errorMessage }, 500);
    }
  } catch (error) {
    console.error("Server error:", error);
    return createResponse({ 
      error: error.message || "Unknown server error" 
    }, 500);
  }
}

// Main server entry point
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  return handleRequest(req);
});
