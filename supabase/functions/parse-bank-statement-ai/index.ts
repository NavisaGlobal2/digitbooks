
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, handleCorsRequest } from "./lib/cors.ts";
import { extractTextFromFile } from "./lib/textExtractor.ts";
import { processWithAI } from "./lib/aiService.ts";
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
    
    // Get the preferred AI provider from the request, if provided
    const preferredProvider = formData.get("preferredProvider")?.toString() || null;
    
    // Get processing context if provided (revenue or expense)
    const context = formData.get("context")?.toString() || null;
    
    // Check if we should use enhanced fallback processing
    const useEnhancedFallback = formData.get("useEnhancedFallback")?.toString() === "true";
    
    // Get auth token for Supabase
    const authToken = formData.get("authToken")?.toString() || null;
    
    // Get file name if not available in file object
    const fileName = formData.get("fileName")?.toString() || (file instanceof File ? file.name : "unknown");
    
    // Only try to set the environment variable if explicitly provided
    // This avoids the "operation not supported" error for PDF files
    if (preferredProvider) {
      try {
        console.log(`Setting preferred AI provider to: ${preferredProvider}`);
        Deno.env.set("PREFERRED_AI_PROVIDER", preferredProvider);
      } catch (envError) {
        // Log but don't fail if we can't set the environment variable
        console.log(`Could not set preferred AI provider: ${envError.message}`);
      }
    }
    
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
      // 1. Extract text from the file
      const fileText = await extractTextFromFile(file);
      console.log(`Successfully extracted text content of length: ${fileText.length} characters`);
      
      // Log some of the extracted content to debug
      console.log(`Sample of extracted content: ${fileText.substring(0, 200)}...`);
      
      let bankData;
      let usedFallback = false;
      let aiServiceUsed = "primary";
      
      // If user prefers enhanced fallback or it's a CSV file, try fallback processor first
      if (useEnhancedFallback || preferredProvider === 'fallback' || fileType === "csv") {
        try {
          console.log("Using enhanced fallback processor first");
          usedFallback = true;
          aiServiceUsed = "enhanced_fallback";
          const fallbackTransactions = await fallbackCSVProcessing(fileText);
          
          bankData = {
            account_holder: undefined,
            account_number: undefined,
            currency: 'USD', // Default currency
            transactions: fallbackTransactions
          };
          
          if (bankData.transactions.length > 0) {
            console.log(`Successfully parsed ${bankData.transactions.length} transactions using fallback processor`);
          } else {
            // If fallback fails to find any transactions, try AI processing
            throw new Error("No transactions found with fallback processor, will try AI");
          }
        } catch (fallbackError) {
          // Only attempt AI processing if not explicitly using fallback
          if (preferredProvider !== 'fallback') {
            console.log("Fallback processing unsuccessful, attempting AI processing:", fallbackError);
            // Try to process with AI service
            try {
              bankData = await processWithAI(fileText, fileType, context);
              usedFallback = false;
              aiServiceUsed = "ai_service";
              
              if (bankData.transactions.length === 0) {
                throw new Error("No transactions were extracted by the AI service");
              }
              
              console.log(`Found ${bankData.transactions.length} transactions using AI service`);
            } catch (aiError) {
              console.error("AI processing failed:", aiError);
              throw aiError; // Let the outer catch handle this
            }
          } else {
            // If explicitly using fallback only, propagate the error
            throw fallbackError;
          }
        }
      } else {
        // Try AI processing first, then fallback to CSV parser if needed
        try {
          // Try to process with AI service
          bankData = await processWithAI(fileText, fileType, context);
          
          // Log sample of transactions for debugging
          if (bankData.transactions.length > 0) {
            console.log(`Sample transaction: ${JSON.stringify(bankData.transactions[0])}`);
            console.log(`Found ${bankData.transactions.length} transactions using AI service`);
          }
          
          if (bankData.transactions.length === 0) {
            throw new Error("No transactions were extracted by the AI service");
          }
        } catch (aiError) {
          console.error("AI processing failed:", aiError);
          
          // If it's a CSV, try the fallback parser as last resort
          if (fileType === "csv" || fileType === "xlsx" || fileType === "xls") {
            console.log("Attempting fallback CSV processing");
            usedFallback = true;
            aiServiceUsed = "fallback_csv";
            const fallbackTransactions = await fallbackCSVProcessing(fileText);
            
            bankData = {
              account_holder: undefined,
              account_number: undefined,
              currency: 'USD', // Default currency
              transactions: fallbackTransactions
            };
            
            if (bankData.transactions.length === 0) {
              return new Response(
                JSON.stringify({ 
                  error: "Could not parse transactions using either AI or fallback methods. Please check the file format." 
                }),
                { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 422 }
              );
            }
          } else {
            // For non-CSV files with a single AI service failure
            return new Response(
              JSON.stringify({ 
                error: `AI processing failed: ${aiError.message}. Please try again with a CSV or Excel file with simpler formatting.` 
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
            );
          }
        }
      }
      
      console.log(`Parsed ${bankData.transactions.length} transactions from file`);
      
      // 3. Store in Supabase if auth token is provided
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
              account_holder: bankData.account_holder || fileName.replace(/\.[^/.]+$/, ""),
              account_number: bankData.account_number || 'Unknown',
              currency: bankData.currency || 'USD'
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
          return new Response(
            JSON.stringify({
              success: true,
              transactions: bankData.transactions,
              message: `Processed ${bankData.transactions.length} transactions but failed to store in database: ${dbError.message}`,
              batchId,
              accountId,
              dbError: dbError.message,
              serviceUsed: aiServiceUsed
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
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
          message: usedFallback 
            ? `Successfully processed ${bankData.transactions.length} transactions using fallback method` 
            : `Successfully processed ${bankData.transactions.length} transactions`,
          batchId,
          serviceUsed: aiServiceUsed
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
