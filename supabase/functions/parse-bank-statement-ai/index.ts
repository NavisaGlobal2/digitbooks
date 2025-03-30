
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { fallbackCSVProcessing } from "./lib/fallbackProcessor.ts";
import { getFileExtension } from "./lib/utils.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return handleCorsRequest();
  }

  try {
    // Parse the request body - this will contain our file
    const formData = await req.formData();
    const file = formData.get("file");
    
    // Get processing context if provided (revenue or expense)
    const context = formData.get("context")?.toString() || null;
    
    // Flag to use raw text extraction
    const useRawText = formData.get("useRawText")?.toString() === "true";
    
    // Get auth token for Supabase
    const authToken = formData.get("authToken")?.toString() || null;
    
    // Get file name if not available in file object
    const fileName = formData.get("fileName")?.toString() || (file instanceof File ? file.name : "unknown");
    
    if (!file || !(file instanceof File)) {
      return new Response(
        JSON.stringify({ error: "No file uploaded or invalid file" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    console.log(`Processing file: ${fileName}, size: ${file.size} bytes`);
    
    // Extract file type for potential fallback decisions
    const fileType = getFileExtension(fileName);
    
    if (context) {
      console.log(`Processing context: ${context}`);
    }
    
    // Generate batch ID for tracking
    const batchId = crypto.randomUUID();
    
    try {
      // Extract text from the file
      const fileText = await extractTextFromFile(file);
      console.log(`Successfully extracted text content of length: ${fileText.length} characters`);
      
      // Log some of the extracted content to debug
      console.log(`Sample of extracted content: ${fileText.substring(0, 200)}...`);
      
      // If raw text extraction is requested, return the text
      if (useRawText) {
        // Use fallback processor as it's more reliable than AI
        const fallbackTransactions = await fallbackCSVProcessing(fileText);
        
        const bankData = {
          account_holder: undefined,
          account_number: undefined,
          currency: 'USD', // Default currency
          transactions: fallbackTransactions
        };
        
        console.log(`Processed ${bankData.transactions.length} transactions using fallback processor`);
        
        // Store in Supabase if auth token is provided
        let accountId = null;
        if (authToken) {
          try {
            // Initialize Supabase client
            const supabaseUrl = Deno.env.get('SUPABASE_URL');
            if (!supabaseUrl) {
              throw new Error('Missing SUPABASE_URL environment variable');
            }
            
            const supabase = createClient(supabaseUrl, authToken);
            
            // Create account record
            const { data: accountData, error: accountError } = await supabase
              .from('bank_statement_accounts')
              .insert([{
                account_holder: fileName.replace(/\.[^/.]+$/, ""),
                account_number: 'Unknown',
                currency: 'USD'
              }])
              .select()
              .single();
            
            if (accountError) {
              console.error('Error storing account:', accountError);
              throw new Error(`Failed to store account: ${accountError.message}`);
            }
            
            accountId = accountData.id;
            
            // Store transactions
            const transactionsToInsert = bankData.transactions.map(tx => ({
              account_id: accountId,
              date: tx.date,
              description: tx.description,
              type: tx.type,
              amount: tx.amount,
              balance: tx.balance
            }));
            
            const { error: txError } = await supabase
              .from('bank_statement_transactions')
              .insert(transactionsToInsert);
            
            if (txError) {
              console.error('Error storing transactions:', txError);
              throw new Error(`Failed to store transactions: ${txError.message}`);
            }
            
            console.log(`Successfully saved ${transactionsToInsert.length} transactions to database`);
          } catch (dbError) {
            console.error('Database error:', dbError);
            // Continue processing but include error in response
          }
        }
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            transactions: bankData.transactions,
            account: {
              id: accountId,
              account_holder: bankData.account_holder,
              account_number: bankData.account_number,
              currency: bankData.currency
            },
            message: `Successfully processed ${bankData.transactions.length} transactions`,
            batchId,
            serviceUsed: "text_extraction",
            rawContent: fileText.substring(0, 1000) + (fileText.length > 1000 ? '...' : '') // Return first 1000 chars of raw text
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Use fallback processor (always)
      const fallbackTransactions = await fallbackCSVProcessing(fileText);
      
      const bankData = {
        account_holder: undefined,
        account_number: undefined,
        currency: 'USD', // Default currency
        transactions: fallbackTransactions
      };
      
      console.log(`Processed ${bankData.transactions.length} transactions using fallback processor`);
      
      // Store in Supabase if auth token is provided
      let accountId = null;
      if (authToken) {
        try {
          // Initialize Supabase client
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          if (!supabaseUrl) {
            throw new Error('Missing SUPABASE_URL environment variable');
          }
          
          const supabase = createClient(supabaseUrl, authToken);
          
          // Create account record
          const { data: accountData, error: accountError } = await supabase
            .from('bank_statement_accounts')
            .insert([{
              account_holder: fileName.replace(/\.[^/.]+$/, ""),
              account_number: 'Unknown',
              currency: 'USD'
            }])
            .select()
            .single();
          
          if (accountError) {
            console.error('Error storing account:', accountError);
            throw new Error(`Failed to store account: ${accountError.message}`);
          }
          
          accountId = accountData.id;
          
          // Store transactions
          const transactionsToInsert = bankData.transactions.map(tx => ({
            account_id: accountId,
            date: tx.date,
            description: tx.description,
            type: tx.type,
            amount: tx.amount,
            balance: tx.balance
          }));
          
          const { error: txError } = await supabase
            .from('bank_statement_transactions')
            .insert(transactionsToInsert);
          
          if (txError) {
            console.error('Error storing transactions:', txError);
            throw new Error(`Failed to store transactions: ${txError.message}`);
          }
          
          console.log(`Successfully saved ${transactionsToInsert.length} transactions to database`);
        } catch (dbError) {
          console.error('Database error:', dbError);
          // Continue processing but include error in response
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          transactions: bankData.transactions,
          account: {
            id: accountId,
            account_holder: bankData.account_holder,
            account_number: bankData.account_number,
            currency: bankData.currency
          },
          message: `Successfully processed ${bankData.transactions.length} transactions`,
          batchId,
          serviceUsed: "text_extraction",
          rawContent: fileText.substring(0, 1000) + (fileText.length > 1000 ? '...' : '') // Return first 1000 chars of raw text
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } catch (processingError) {
      console.error("Processing error:", processingError);
      
      return new Response(
        JSON.stringify({ 
          error: processingError.message || "Unknown processing error",
          errorDetails: processingError.stack || "No stack trace available",
          suggestions: [
            "Try a CSV file with simpler formatting",
            "Make sure your file contains transaction data in a tabular format",
            "Check that date, description and amount columns are clearly identified"
          ]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Unknown server error",
        errorDetails: error.stack || "No stack trace available" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
