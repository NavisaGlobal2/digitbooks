
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
    throw new Error("Missing OPENAI_API_KEY");
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
        model: "gpt-4o",
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header", errorType: "authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    console.log(`Token received, length: ${token.length}`);
    
    if (!token || token.length < 10) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication token", errorType: "authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    // Create Supabase clients - one with user token, one with service key
    const supabaseClient = createClient(supabaseUrl, token, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get the user
    const { data: userData, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !userData.user) {
      console.error("Auth error:", userError || "No user found");
      return new Response(
        JSON.stringify({ error: userError?.message || "Authentication failed", errorType: "authentication" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }
    
    const userId = userData.user.id;
    console.log(`Processing request for user: ${userId}`);
    
    // Parse the form data
    const formData = await req.formData();
    const file = formData.get("file");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    console.log(`Processing file: ${file.name}, size: ${file.size} bytes, batchId: ${batchId}`);
    
    try {
      // 1. Extract text from the file
      const fileText = await extractTextFromFile(file);
      
      // 2. Process with OpenAI
      const transactions = await processWithOpenAI(fileText);
      
      console.log(`Parsed ${transactions.length} transactions from file`);
      
      // 3. Save the transactions to the database
      let savedCount = 0;
      const BATCH_SIZE = 50;
      
      for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
        const batch = transactions.slice(i, i + BATCH_SIZE);
        
        const { error } = await supabaseAdmin
          .from("uploaded_bank_lines")
          .insert(batch.map((t: any) => ({
            user_id: userId,
            upload_batch_id: batchId,
            date: t.date,
            description: t.description,
            amount: t.amount,
            type: t.type,
            status: "unprocessed"
          })));
        
        if (error) {
          console.error("Error saving transactions:", error);
          throw new Error(`Failed to save transactions: ${error.message}`);
        }
        
        savedCount += batch.length;
      }
      
      console.log(`Successfully saved ${savedCount} transactions to database`);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions,
          message: `Successfully processed ${savedCount} transactions`, 
          batchId,
          transactionCount: savedCount
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      console.error("Processing error:", processingError);
      return new Response(
        JSON.stringify({ error: processingError.message }),
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
