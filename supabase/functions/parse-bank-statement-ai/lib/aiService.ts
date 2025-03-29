
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
  
  // Check if this is Vision API extracted text
  const isVisionExtracted = text.includes('[PDF BANK STATEMENT EXTRACTED WITH GOOGLE VISION API:');
  
  if (isVisionExtracted) {
    console.log('DETECTED VISION API EXTRACTED TEXT - Using special processing to ensure real data extraction');
  }
  
  // Always force real data extraction with very strong prompting
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
    enhancedText += `\n\nEXTREMELY IMPORTANT: This is REAL FINANCIAL DATA. Users have reported receiving placeholder/dummy transactions instead of their real data. 
DO NOT GENERATE ANY FICTIONAL TRANSACTIONS under any circumstances.
Examine the input carefully for patterns that represent actual financial transactions.
If you can't extract real transactions, return an empty array [].
The user's financial decisions depend on accurate data - providing fictional data could cause serious harm.`;
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
        extractRealData: true,
        isVisionExtracted
      });
      
      // Validate the result to ensure we're not getting placeholder data
      const hasValidTransactions = Array.isArray(result) && result.length > 0;
      const isDummyData = detectPotentialDummyData(result);
      
      if (hasValidTransactions && !isDummyData) {
        console.log(`[${processingId}] Anthropic successfully processed ${result.length} transactions`);
        return result;
      } else if (isDummyData) {
        console.log(`[${processingId}] Detected potential dummy data from Anthropic, trying DeepSeek`);
        if (hasDeepseekKey) {
          return await processWithDeepseek(enhancedText, context, {
            ...options,
            processingId,
            forceRealData: true,
            extractRealData: true,
            isVisionExtracted
          });
        } else {
          console.log(`[${processingId}] No DeepSeek available, returning empty array instead of dummy data`);
          return [];
        }
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
        extractRealData: true,
        isVisionExtracted
      });
      
      const hasValidTransactions = Array.isArray(result) && result.length > 0;
      const isDummyData = detectPotentialDummyData(result);
      
      if (hasValidTransactions && !isDummyData) {
        console.log(`[${processingId}] DeepSeek successfully processed ${result.length} transactions`);
        return result;
      } else if (isDummyData) {
        console.log(`[${processingId}] Detected potential dummy data from DeepSeek, trying Anthropic`);
        if (hasAnthropicKey) {
          return await processWithAnthropic(enhancedText, context, {
            ...options,
            processingId,
            forceRealData: true,
            extractRealData: true,
            isVisionExtracted
          });
        } else {
          console.log(`[${processingId}] No Anthropic available, returning empty array instead of dummy data`);
          return [];
        }
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

/**
 * Check if the transactions appear to be made-up dummy data
 */
function detectPotentialDummyData(transactions: any[]): boolean {
  if (!Array.isArray(transactions) || transactions.length === 0) return false;
  
  // Common placeholder terms that indicate AI-generated data
  const suspiciousTerms = [
    'grocery', 'netflix', 'amazon', 'uber', 'walmart', 'target', 'starbucks',
    'restaurant', 'gas station', 'coffee', 'deposit', 'withdrawal', 'paycheck',
    'salary', 'example', 'sample', 'placeholder', 'dummy', 'test'
  ];
  
  // Check for suspicious descriptions
  const suspiciousDescriptions = transactions.filter(tx => {
    if (!tx.description) return false;
    const desc = tx.description.toLowerCase();
    return suspiciousTerms.some(term => desc.includes(term.toLowerCase()));
  });
  
  // If more than 50% of transactions have suspicious descriptions
  if (suspiciousDescriptions.length / transactions.length > 0.5) {
    console.log('Detected likely dummy data: Too many generic descriptions');
    return true;
  }
  
  // Check for perfectly rounded amounts (like $100.00, $50.00)
  const roundedAmounts = transactions.filter(tx => 
    typeof tx.amount === 'number' && tx.amount % 10 === 0 && tx.amount !== 0
  );
  
  // If more than 40% of amounts are perfectly rounded
  if (roundedAmounts.length / transactions.length > 0.4) {
    console.log('Detected likely dummy data: Too many rounded amounts');
    return true;
  }
  
  // Check for sequential dates
  if (transactions.length > 3) {
    // Sort transactions by date
    const sortedByDate = [...transactions].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    let sequentialDateCount = 0;
    for (let i = 1; i < sortedByDate.length; i++) {
      if (!sortedByDate[i-1].date || !sortedByDate[i].date) continue;
      
      const prevDate = new Date(sortedByDate[i-1].date);
      const currDate = new Date(sortedByDate[i].date);
      
      if (isNaN(prevDate.getTime()) || isNaN(currDate.getTime())) continue;
      
      // Check if dates are exactly 1, 7, or 30 days apart
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
      if (diffDays === 1 || diffDays === 7 || diffDays === 30) {
        sequentialDateCount++;
      }
    }
    
    // If more than 70% of dates follow a perfect pattern
    if (sequentialDateCount > sortedByDate.length * 0.7) {
      console.log('Detected likely dummy data: Too many sequential dates');
      return true;
    }
  }
  
  return false;
}
