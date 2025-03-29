
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
    forceRealData?: boolean;
    extractRealData?: boolean;
    noDummyData?: boolean;
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
    enhancedText += `\n\nCRITICAL INSTRUCTIONS FOR PDF BANK STATEMENT PROCESSING:
1. Focus EXCLUSIVELY on extracting the actual transactions from the PDF statement
2. DO NOT generate fictional transactions - only extract real transactions from the document
3. Extract EVERY visible transaction with exact dates, descriptions, and amounts
4. For transaction amounts:
   - Use NEGATIVE numbers for withdrawals/debits (money leaving the account)
   - Use POSITIVE numbers for deposits/credits (money entering the account)
5. Dates must be in ISO format (YYYY-MM-DD) regardless of how they appear in the statement
6. Include ALL transaction details in the description field
7. Return ONLY valid transaction data in JSON format
8. IF YOU CANNOT IDENTIFY ANY REAL TRANSACTIONS, RETURN AN EMPTY ARRAY - NEVER GENERATE FICTIONAL DATA

This is REAL bank statement data that needs accurate extraction, not dummy data generation.

DO NOT INVENT ANY TRANSACTIONS - ONLY EXTRACT WHAT YOU CAN ACTUALLY SEE IN THE DATA.
`;

    if (context === "revenue") {
      enhancedText += "\nSince the context is revenue tracking, pay special attention to incoming payments and credits.";
    }
    
    // Always enforce real data extraction for PDFs
    const forceRealData = options?.forceRealData === true || 
                          options?.extractRealData === true || 
                          options?.noDummyData === true;
    
    if (forceRealData) {
      enhancedText += `\n\nEXTREMELY IMPORTANT: This is REAL FINANCIAL DATA. Users have reported receiving placeholder/dummy transactions instead of their real data. 
DO NOT GENERATE ANY FICTIONAL TRANSACTIONS under any circumstances.
Examine the input carefully for patterns that represent actual financial transactions.
If you can't extract real transactions, return an empty array [].
It is better to return no data than to make up transactions.`;
    }
  }
  
  // Add a processing attempt marker to help track issues
  const processingId = crypto.randomUUID().substring(0, 8);
  console.log(`Processing request ${processingId} with ${preferredProvider} as primary provider`);
  
  // First try the preferred provider
  try {
    if (preferredProvider === "anthropic" && hasAnthropicKey) {
      console.log(`[${processingId}] Attempting to process with Anthropic`);
      const result = await processWithAnthropic(enhancedText, context, {
        ...options,
        processingId,
        forceRealData: true,  // Always force real data
        extractRealData: true
      });
      
      // Validate the result to ensure we're not getting placeholder data
      if (Array.isArray(result) && result.length > 0) {
        console.log(`[${processingId}] Anthropic successfully processed ${result.length} transactions`);
        return result;
      } else {
        console.log(`[${processingId}] Anthropic returned empty result, trying DeepSeek`);
        if (hasDeepseekKey) {
          return await processWithDeepseek(enhancedText, context, {
            ...options,
            processingId,
            forceRealData: true,
            extractRealData: true
          });
        } else {
          return [];
        }
      }
    } else if (preferredProvider === "deepseek" && hasDeepseekKey) {
      console.log(`[${processingId}] Attempting to process with DeepSeek`);
      const result = await processWithDeepseek(enhancedText, context, {
        ...options,
        processingId,
        forceRealData: true,
        extractRealData: true
      });
      
      if (Array.isArray(result) && result.length > 0) {
        console.log(`[${processingId}] DeepSeek successfully processed ${result.length} transactions`);
        return result;
      } else {
        console.log(`[${processingId}] DeepSeek returned empty result, trying Anthropic`);
        if (hasAnthropicKey) {
          return await processWithAnthropic(enhancedText, context, {
            ...options,
            processingId,
            forceRealData: true,
            extractRealData: true
          });
        } else {
          return [];
        }
      }
    } else if (hasAnthropicKey) {
      return await processWithAnthropic(enhancedText, context, {
        ...options,
        processingId,
        forceRealData: true,
        extractRealData: true
      });
    } else if (hasDeepseekKey) {
      return await processWithDeepseek(enhancedText, context, {
        ...options,
        processingId,
        forceRealData: true,
        extractRealData: true
      });
    } else {
      throw new Error("No AI provider is configured. Please set up either Anthropic API key (ANTHROPIC_API_KEY) or DeepSeek API key (DEEPSEEK_API_KEY) in Supabase.");
    }
  } catch (error) {
    console.error(`[${processingId}] Error processing with AI:`, error);
    
    // If this was a processing error related to PDF or data extraction,
    // return empty array instead of throwing error
    if (error.message?.includes('generate') || 
        error.message?.includes('dummy') || 
        error.message?.includes('placeholder') ||
        error.message?.includes('fictional')) {
      console.log(`[${processingId}] Detected AI trying to generate dummy data, returning empty array`);
      return [];
    }
    
    throw error;
  }
}
