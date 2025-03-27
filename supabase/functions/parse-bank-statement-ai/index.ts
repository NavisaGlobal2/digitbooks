
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
    // For now, we'll just note that it's a PDF and ask OpenAI to be smart about it
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

async function processWithOpenAI(text: string): Promise<any> {
  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured. Please set up your OpenAI API key in Supabase.");
  }

  console.log("Sending to OpenAI for processing...");
  
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a financial data extraction assistant. Your task is to parse bank statement data from various formats and output a clean JSON array of transactions. 
            
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
            ]`
          },
          {
            role: "user",
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      
      // Handle quota exceeded error specifically
      if (error.error?.type === "insufficient_quota") {
        throw new Error("OpenAI API quota exceeded. Please check your billing details or use a different API key.");
      }
      
      throw new Error(`OpenAI API error: ${error.error?.message || "Unknown error"}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Parse the JSON response - OpenAI should return only JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", content);
      throw new Error("Could not parse transactions from OpenAI response");
    }
  } catch (error) {
    console.error("Error processing with OpenAI:", error);
    throw error;
  }
}

// Get authenticated user from request
async function getUserFromRequest(req: Request): Promise<any> {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }
    
    // Create supabase admin client to verify token
    // This is a simplified version - in production you'd want to use
    // the Supabase client properly configured with your service role key
    return true; // Simplified for this example
  } catch (error) {
    console.error("Auth error getting user:", error);
    throw new Error("Authentication failed: " + error.message);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Validate that OpenAI API key exists
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: "OPENAI_API_KEY is not configured. Please set up your OpenAI API key in Supabase." 
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
      
      // 2. Process with OpenAI
      const transactions = await processWithOpenAI(fileText);
      
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions,
          message: `Successfully processed ${transactions.length} transactions`, 
          batchId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      console.error("Processing error:", processingError);
      
      // Check if error is related to OpenAI API key
      const errorMessage = processingError.message || "Unknown processing error";
      if (
        errorMessage.includes("OpenAI API quota exceeded") || 
        errorMessage.includes("OpenAI") && 
        errorMessage.includes("API key")
      ) {
        return new Response(
          JSON.stringify({ 
            error: "OpenAI API key issue: " + errorMessage
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
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
