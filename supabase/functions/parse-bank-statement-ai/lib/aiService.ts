import { processWithAnthropic } from "./anthropicProcessor.ts";
import { processWithDeepseek } from "./deepseekProcessor.ts";

/**
 * Format transaction data using AI services to standardize structure
 * while preserving all original data values
 */
export async function formatTransactionsWithAI(transactions: any[], context?: string): Promise<any[]> {
  if (!transactions || transactions.length === 0) {
    return [];
  }
  
  // Check available AI providers
  const hasAnthropicKey = !!Deno.env.get("ANTHROPIC_API_KEY");
  const hasDeepseekKey = !!Deno.env.get("DEEPSEEK_API_KEY");
  
  // Check preferred provider if set
  const preferredProvider = Deno.env.get("PREFERRED_AI_PROVIDER")?.toLowerCase() || "anthropic";
  
  console.log(`Available providers for formatting: ${hasAnthropicKey ? 'Anthropic, ' : ''}${hasDeepseekKey ? 'DeepSeek' : ''}`);
  console.log(`Using ${preferredProvider} for transaction formatting`);
  
  // Prepare the input for the AI - include only the first few transactions as examples
  const sampleTransactions = transactions.slice(0, Math.min(3, transactions.length));
  
  // Create instructions for the AI
  const instructions = `
FORMATTING TASK: You are analyzing financial transaction data that has already been parsed from a file. 
DO NOT change any values, amounts, dates or descriptions. Your ONLY task is to standardize the structure of the data.

The data is already correct, DO NOT modify:
- Transaction dates
- Transaction amounts 
- Transaction descriptions
- Any other values in the data

YOUR TASK:
1. Analyze the structure of these sample transactions: ${JSON.stringify(sampleTransactions, null, 2)}
2. Return a formatting template showing how the final structure should look
3. Include field mappings if needed, but DO NOT modify any values

Recommended output format should include these fields (map from existing fields, don't invent data):
- date: Use existing date field (convert to YYYY-MM-DD format if needed)
- description: Use existing description/narrative field
- amount: Use existing amount field (ensure it's a number)
- type: 'debit' if amount is negative, 'credit' if positive
- selected: Boolean value, default based on transaction type
- category: Use existing category if present, otherwise leave empty string
- id: Generate from existing ID or hash of transaction details
- preservedColumns: Include ALL fields from the original data

Return ONLY a JSON object with:
{
  "formatInstructions": {
    "fieldMappings": {}, // Show which original fields map to which standardized fields
    "formatTemplate": {}, // Show the standardized structure with placeholder values
    "preserveAllOriginalFields": true // Always true to ensure we keep all data
  }
}
`;

  try {
    // First try the preferred provider
    if (preferredProvider === "anthropic" && hasAnthropicKey) {
      const response = await processWithAnthropic(instructions, context);
      if (response && typeof response === 'object') {
        return applyFormatToTransactions(transactions, response);
      }
    } else if (preferredProvider === "deepseek" && hasDeepseekKey) {
      const response = await processWithDeepseek(instructions, context);
      if (response && typeof response === 'object') {
        return applyFormatToTransactions(transactions, response);
      }
    } else if (hasAnthropicKey) {
      const response = await processWithAnthropic(instructions, context);
      if (response && typeof response === 'object') {
        return applyFormatToTransactions(transactions, response);
      }
    } else if (hasDeepseekKey) {
      const response = await processWithDeepseek(instructions, context);
      if (response && typeof response === 'object') {
        return applyFormatToTransactions(transactions, response);
      }
    }
    
    // If none of the above worked, return the original transactions
    console.log("Unable to apply formatting with AI, returning original transactions");
    return transactions;
  } catch (error) {
    console.error("Error in formatTransactionsWithAI:", error);
    // Return the original transactions if there's an error
    return transactions;
  }
}

/**
 * Apply the formatting instructions from the AI to all transactions
 */
function applyFormatToTransactions(transactions: any[], formatInstructions: any): any[] {
  try {
    if (!formatInstructions.formatInstructions) {
      console.log("Invalid format instructions received from AI, returning original transactions");
      return transactions;
    }
    
    const mappings = formatInstructions.formatInstructions.fieldMappings || {};
    
    return transactions.map(transaction => {
      // Start with a copy of the original transaction to preserve all fields
      const formatted: any = { ...transaction };
      
      // Make sure the minimum required fields are present
      formatted.id = transaction.id || `tx-${Math.random().toString(36).substr(2, 9)}`;
      formatted.date = transaction.date || transaction.transactionDate || new Date().toISOString().split('T')[0];
      formatted.description = transaction.description || transaction.narrative || transaction.memo || "";
      
      // Handle amount field and type
      if (typeof transaction.amount === 'number' || (transaction.amount && !isNaN(parseFloat(transaction.amount)))) {
        formatted.amount = typeof transaction.amount === 'number' ? transaction.amount : parseFloat(transaction.amount);
      } else if (transaction.debit && !isNaN(parseFloat(transaction.debit))) {
        formatted.amount = -Math.abs(parseFloat(transaction.debit));
      } else if (transaction.credit && !isNaN(parseFloat(transaction.credit))) {
        formatted.amount = Math.abs(parseFloat(transaction.credit));
      } else {
        formatted.amount = 0;
      }
      
      // Determine transaction type based on amount sign
      formatted.type = formatted.amount < 0 ? "debit" : "credit";
      
      // Pre-select debits by default
      formatted.selected = formatted.type === "debit";
      
      // Store all original fields in preservedColumns
      formatted.preservedColumns = { ...transaction };
      
      return formatted;
    });
  } catch (error) {
    console.error("Error applying format to transactions:", error);
    return transactions;
  }
}

/**
 * Process extracted text with AI services
 * When excelData is provided, it will be used directly without AI processing
 */
export async function processWithAI(text: string, fileType: string, context?: string, excelData?: any[]): Promise<any> {
  // If we have direct Excel data, use it without AI processing
  if (excelData && Array.isArray(excelData)) {
    console.log(`Using direct Excel data: ${excelData.length} rows`);
    return excelData;
  }
  
  // Otherwise use AI processing for non-Excel files or as fallback
  // Check available AI providers
  const hasAnthropicKey = !!Deno.env.get("ANTHROPIC_API_KEY");
  const hasDeepseekKey = !!Deno.env.get("DEEPSEEK_API_KEY");
  
  // Check preferred provider if set
  const preferredProvider = Deno.env.get("PREFERRED_AI_PROVIDER")?.toLowerCase() || "anthropic";
  
  console.log(`Available providers: ${hasAnthropicKey ? 'Anthropic, ' : ''}${hasDeepseekKey ? 'DeepSeek' : ''}`);
  console.log(`AI processing: using ${preferredProvider} as preferred provider`);
  
  // Handle PDF files with more detailed instructions
  let enhancedText = text;
  if (fileType === 'pdf') {
    enhancedText += `\n\nIMPORTANT INSTRUCTIONS FOR PDF BANK STATEMENT PROCESSING:
1. Focus EXCLUSIVELY on extracting the actual transactions from the PDF statement
2. Extract EVERY transaction with exact dates, descriptions, and amounts
3. For transaction amounts:
   - Use NEGATIVE numbers for withdrawals/debits (money leaving the account)
   - Use POSITIVE numbers for deposits/credits (money entering the account)
4. Dates must be in ISO format (YYYY-MM-DD) regardless of how they appear in the statement
5. Include ALL transaction details in the description field
6. Return ONLY valid transaction data, ignoring headers, footers, and marketing content
7. Format your response as a JSON array of transaction objects with the schema:
   [{"date": "YYYY-MM-DD", "description": "Transaction description", "amount": 123.45, "type": "credit|debit"}]

If you are unsure about any transaction, do your best to extract the information accurately rather than skipping it.
`;

    if (context === "revenue") {
      enhancedText += "\nSince the context is revenue tracking, pay special attention to incoming payments and credits.";
    }
  }
  
  // First try the preferred provider
  if (preferredProvider === "anthropic" && hasAnthropicKey) {
    try {
      return await processWithAnthropic(enhancedText, context);
    } catch (error) {
      console.error("Error processing with Anthropic:", error);
      
      // Fall back to DeepSeek if available
      if (hasDeepseekKey) {
        console.log("Falling back to DeepSeek...");
        return await processWithDeepseek(enhancedText, context);
      } else {
        throw error;
      }
    }
  } else if (preferredProvider === "deepseek" && hasDeepseekKey) {
    try {
      return await processWithDeepseek(enhancedText, context);
    } catch (error) {
      console.error("Error processing with DeepSeek:", error);
      
      // Fall back to Anthropic if available
      if (hasAnthropicKey) {
        console.log("Falling back to Anthropic...");
        return await processWithAnthropic(enhancedText, context);
      } else {
        throw error;
      }
    }
  } else if (hasAnthropicKey) {
    return await processWithAnthropic(enhancedText, context);
  } else if (hasDeepseekKey) {
    return await processWithDeepseek(enhancedText, context);
  } else {
    throw new Error("No AI provider is configured. Please set up either Anthropic API key (ANTHROPIC_API_KEY) or DeepSeek API key (DEEPSEEK_API_KEY) in Supabase.");
  }
}
