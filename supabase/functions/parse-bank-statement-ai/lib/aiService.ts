
// AI service for formatting transactions while preserving original data
import { Transaction } from './types.ts';
import { processWithAnthropic } from './anthropicProcessor.ts';
import { processWithDeepseek } from './deepseekProcessor.ts';

// Function to format transactions using AI while preserving original data
export async function formatTransactionsWithAI(
  transactions: Transaction[],
  context?: string | null,
  preferredProvider?: string
): Promise<Transaction[]> {
  try {
    console.log(`Formatting ${transactions.length} transactions with AI`);
    
    // If there are no transactions, return the empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }

    // Log the first raw transaction for debugging
    if (transactions.length > 0) {
      console.log("SAMPLE RAW TRANSACTION FROM PARSER:", 
        JSON.stringify(transactions[0], null, 2));
    }

    // Determine which AI provider to use based on preference and available API keys
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    
    console.log("Available providers for formatting: " + 
      (anthropicApiKey ? "Anthropic, " : "") + 
      (deepseekApiKey ? "DeepSeek" : "")
    );

    // Default to Anthropic if available, unless DeepSeek is specifically requested
    let useAnthropicByDefault = !!anthropicApiKey;
    
    // If a preferred provider is specified, try to use it
    let provider = "none";
    if (preferredProvider === "anthropic" && anthropicApiKey) {
      provider = "anthropic";
      console.log("Using anthropic for transaction formatting");
    } else if (preferredProvider === "deepseek" && deepseekApiKey) {
      provider = "deepseek";
      console.log("Using deepseek for transaction formatting");
    } else if (useAnthropicByDefault) {
      provider = "anthropic";
      console.log("Using anthropic for transaction formatting (default)");
    } else if (deepseekApiKey) {
      provider = "deepseek";
      console.log("Using deepseek for transaction formatting (fallback)");
    } else {
      // No AI service available, do basic formatting
      console.log("No AI service configured. Using basic formatting.");
      return basicFormatting(transactions);
    }
    
    try {
      // Extract essential transaction data for AI processing
      const transactionData = transactions.map(tx => ({
        date: tx.date || "",
        description: tx.description || "",
        amount: tx.amount || 0,
        type: tx.type || ""
      }));
      
      // Log the simplified data being sent to AI
      console.log("SIMPLIFIED DATA FOR AI:", 
        JSON.stringify(transactionData.slice(0, 2), null, 2));
      console.log(`Total transactions for AI: ${transactionData.length}`);
      
      // Send to the selected AI service
      let aiProcessedData;
      if (provider === "anthropic") {
        aiProcessedData = await processWithAnthropic(JSON.stringify(transactionData), context);
      } else if (provider === "deepseek") {
        aiProcessedData = await processWithDeepseek(JSON.stringify(transactionData), context);
      }
      
      // Log sample of AI response
      if (aiProcessedData && Array.isArray(aiProcessedData) && aiProcessedData.length > 0) {
        console.log("SAMPLE AI PROCESSED TRANSACTION:", 
          JSON.stringify(aiProcessedData[0], null, 2));
      } else {
        console.log("AI processing returned invalid data format:", typeof aiProcessedData);
      }
      
      if (!aiProcessedData || !Array.isArray(aiProcessedData)) {
        console.log("AI processing failed or returned invalid data. Falling back to basic formatting.");
        return basicFormatting(transactions);
      }
      
      // Merge AI processed data with original transaction data to preserve all fields
      const formattedTransactions = transactions.map((originalTx, index) => {
        const aiTx = aiProcessedData[index] || {};
        
        // Generate a unique ID if one is not provided
        const id = originalTx.id || `tx-${crypto.randomUUID()}`;
        
        // Preserve original values but prefer AI formatted values if available
        const mergedTransaction = {
          id,
          date: aiTx.date || originalTx.date || new Date().toISOString(),
          description: aiTx.description || originalTx.description || "Unknown Transaction",
          amount: typeof aiTx.amount === "number" ? aiTx.amount : 
                (typeof originalTx.amount === "number" ? originalTx.amount : 0),
          type: aiTx.type || originalTx.type || (
            (typeof aiTx.amount === "number" && aiTx.amount < 0) || 
            (typeof originalTx.amount === "number" && originalTx.amount < 0) ? 
            "debit" : "credit"
          ),
          
          // Additional fields that might be added by the AI
          category: aiTx.category || originalTx.category || "",
          selected: aiTx.selected !== undefined ? aiTx.selected : 
                  (originalTx.selected !== undefined ? originalTx.selected : 
                  (aiTx.type === "debit" || originalTx.type === "debit")),
          source: aiTx.source || originalTx.source || "",
          
          // Store any source suggestions from AI
          sourceSuggestion: aiTx.sourceSuggestion,
          categorySuggestion: aiTx.categorySuggestion,
          
          // Store the original values explicitly
          originalDate: originalTx.date,
          originalAmount: originalTx.amount,
          
          // Store all original data
          preservedColumns: { ...originalTx }
        };
        
        // Log first merged transaction to show the final result
        if (index === 0) {
          console.log("SAMPLE MERGED TRANSACTION:", 
            JSON.stringify(mergedTransaction, null, 2));
        }
        
        return mergedTransaction;
      });
      
      console.log("Successfully applied AI formatting to transactions");
      return formattedTransactions;
    } catch (aiError) {
      console.error("Error in AI processing:", aiError);
      // Fall back to basic formatting if AI processing fails
      return basicFormatting(transactions);
    }
  } catch (error) {
    console.error("Error formatting transactions with AI:", error);
    // Return original transactions if formatting fails
    return transactions;
  }
}

// Basic formatting function as a fallback
function basicFormatting(transactions: Transaction[]): Transaction[] {
  // Create a copy of all transactions with standardized structure
  return transactions.map(transaction => {
    // Create a copy of all original data to preserve
    const preservedColumns = { ...transaction };
    
    // Generate a unique ID if one is not provided
    const id = transaction.id || `tx-${crypto.randomUUID()}`;
    
    // Handle date: use date property or fallbacks to other common date fields
    const dateValue = transaction.date || 
                     transaction.transactionDate || 
                     transaction.valueDate || 
                     transaction.postingDate || 
                     transaction.bookingDate || 
                     new Date().toISOString();
    
    // Handle description: use description or fallbacks to other common description fields
    const description = transaction.description || 
                       transaction.narrative || 
                       transaction.details || 
                       transaction.memo || 
                       transaction.reference || 
                       transaction.merchantName || 
                       'Unknown Transaction';
                       
    // Handle amount: convert to number if possible
    let amount = 0;
    if (typeof transaction.amount === 'number') {
      amount = transaction.amount;
    } else if (transaction.amount !== undefined) {
      // Try to parse the amount as a number if it's a string
      amount = parseFloat(String(transaction.amount).replace(/[^0-9.-]+/g, ''));
    } else if (transaction.debit && parseFloat(String(transaction.debit)) > 0) {
      // If there's a debit field, use that as a negative amount
      amount = -parseFloat(String(transaction.debit));
    } else if (transaction.credit && parseFloat(String(transaction.credit)) > 0) {
      // If there's a credit field, use that as a positive amount
      amount = parseFloat(String(transaction.credit));
    } else if (transaction.value) {
      // Try value field as a fallback
      amount = parseFloat(String(transaction.value));
    }
    
    // Determine transaction type based on amount or explicit type
    let type = transaction.type;
    if (!type) {
      if (amount < 0) {
        type = 'debit';
      } else if (amount > 0) {
        type = 'credit';
      } else {
        type = 'unknown';
      }
    }
    
    // Determine if the transaction should be selected by default
    const selected = transaction.selected !== undefined ? 
                    transaction.selected : 
                    (type === 'debit');
                    
    // For category, use the existing one or leave blank for the user to fill
    const category = transaction.category || "";
    
    // For source, preserve if exists or leave blank
    const source = transaction.source || "";

    // Create the standardized transaction object with all original data preserved
    return {
      id,
      date: dateValue,
      description,
      amount: isNaN(amount) ? 0 : amount,
      type,
      category,
      selected,
      source,
      
      // Store the original values explicitly
      originalDate: transaction.date,
      originalAmount: transaction.amount,
      
      // Store all original data
      preservedColumns
    };
  });
}
