
import { processWithAnthropic } from "./anthropicProcessor.ts";
import { processWithDeepseek } from "./deepseekProcessor.ts";

/**
 * Process extracted text with AI services
 */
export async function processWithAI(
  text: string, 
  fileType: string, 
  context?: string, 
  options?: {
    isSpecialPdfFormat?: boolean;
    fileName?: string;
    fileSize?: number;
  }
): Promise<any> {
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
2. DO NOT generate fictional transactions - only extract real transactions from the document
3. Extract EVERY visible transaction with exact dates, descriptions, and amounts
4. For transaction amounts:
   - Use NEGATIVE numbers for withdrawals/debits (money leaving the account)
   - Use POSITIVE numbers for deposits/credits (money entering the account)
5. Dates must be in ISO format (YYYY-MM-DD) regardless of how they appear in the statement
6. Include ALL transaction details in the description field
7. Return ONLY valid transaction data in JSON format

This is REAL bank statement data that needs accurate extraction, not dummy data generation.
`;

    if (context === "revenue") {
      enhancedText += "\nSince the context is revenue tracking, pay special attention to incoming payments and credits.";
    }
  }
  
  // First try the preferred provider
  if (preferredProvider === "anthropic" && hasAnthropicKey) {
    try {
      return await processWithAnthropic(enhancedText, context, options);
    } catch (error) {
      console.error("Error processing with Anthropic:", error);
      
      // Fall back to DeepSeek if available
      if (hasDeepseekKey) {
        console.log("Falling back to DeepSeek...");
        return await processWithDeepseek(enhancedText, context, options);
      } else {
        throw error;
      }
    }
  } else if (preferredProvider === "deepseek" && hasDeepseekKey) {
    try {
      return await processWithDeepseek(enhancedText, context, options);
    } catch (error) {
      console.error("Error processing with DeepSeek:", error);
      
      // Fall back to Anthropic if available
      if (hasAnthropicKey) {
        console.log("Falling back to Anthropic...");
        return await processWithAnthropic(enhancedText, context, options);
      } else {
        throw error;
      }
    }
  } else if (hasAnthropicKey) {
    return await processWithAnthropic(enhancedText, context, options);
  } else if (hasDeepseekKey) {
    return await processWithDeepseek(enhancedText, context, options);
  } else {
    throw new Error("No AI provider is configured. Please set up either Anthropic API key (ANTHROPIC_API_KEY) or DeepSeek API key (DEEPSEEK_API_KEY) in Supabase.");
  }
}
