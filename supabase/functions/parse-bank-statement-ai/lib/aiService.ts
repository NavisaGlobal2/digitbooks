
import { processWithAnthropic } from "./anthropicProcessor.ts";
import { processWithDeepseek } from "./deepseekProcessor.ts";
import { sanitizeTextForAPI } from "./utils.ts";

/**
 * Process extracted text with AI services
 */
export async function processWithAI(text: string, fileType: string, context?: string): Promise<any> {
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
  
  // For Excel files, add special handling instructions
  if (fileType === 'xlsx' || fileType === 'xls') {
    enhancedText += `\n\nIMPORTANT FOR EXCEL PROCESSING:
1. Look for table structures that contain transaction data (date, description, amount)
2. Particularly focus on columns that might contain dates and monetary values
3. If a column appears to contain both debits and credits, split them accordingly
4. For any amounts, use negative values for debits and positive for credits
5. Format all dates as YYYY-MM-DD regardless of original format`;
  }
  
  // Ensure text is properly sanitized
  enhancedText = sanitizeTextForAPI(enhancedText);
  
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
