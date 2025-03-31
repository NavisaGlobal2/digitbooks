
// AI service for formatting transactions while preserving original data
import { Transaction } from './types.ts';
import { processWithAnthropic } from './anthropicProcessor.ts';
import { processWithDeepseek } from './deepseekProcessor.ts';
import { basicFormatting } from './utils/basicFormatter.ts';
import { selectAIProvider } from './utils/aiProviderSelector.ts';
import { mergeTransactionData, logSampleTransactions, filterInvalidTransactions } from './utils/dataProcessor.ts';

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
    logSampleTransactions(transactions, "SAMPLE RAW TRANSACTION FROM PARSER");

    // Get available providers
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    const deepseekApiKey = Deno.env.get("DEEPSEEK_API_KEY");
    
    // Check if we have any AI providers configured
    const hasAnthropicProvider = !!anthropicApiKey;
    const hasDeepseekProvider = !!deepseekApiKey;
    
    // If no AI provider is available, use basic formatting
    if (!hasAnthropicProvider && !hasDeepseekProvider) {
      console.log("No AI providers available. Using basic formatting.");
      const basicFormatted = basicFormatting(transactions);
      return filterInvalidTransactions(basicFormatted);
    }
    
    // Determine which AI provider to try first
    const { provider: firstProvider } = selectAIProvider(preferredProvider);
    
    try {
      // Send the ENTIRE raw transaction data to the AI model, preserving ALL original structure
      console.log("Sending RAW transaction data directly to AI without preprocessing");
      console.log(`Total transactions for AI: ${transactions.length}`);
      logSampleTransactions(transactions, "SAMPLE RAW DATA FOR AI");
      
      // Try with the first selected AI service
      let aiProcessedData;
      if (firstProvider === "anthropic" && hasAnthropicProvider) {
        console.log("Trying Anthropic for AI processing...");
        try {
          aiProcessedData = await processWithAnthropic(JSON.stringify(transactions), context);
        } catch (anthropicError) {
          // If Anthropic fails and we have DeepSeek available, try that
          if (hasDeepseekProvider) {
            console.log("Anthropic processing failed. Trying DeepSeek as fallback...");
            aiProcessedData = await processWithDeepseek(JSON.stringify(transactions), context);
          } else {
            // No secondary AI service available
            throw anthropicError;
          }
        }
      } else if (firstProvider === "deepseek" && hasDeepseekProvider) {
        console.log("Trying DeepSeek for AI processing...");
        try {
          aiProcessedData = await processWithDeepseek(JSON.stringify(transactions), context);
        } catch (deepseekError) {
          // If DeepSeek fails and we have Anthropic available, try that
          if (hasAnthropicProvider) {
            console.log("DeepSeek processing failed. Trying Anthropic as fallback...");
            aiProcessedData = await processWithAnthropic(JSON.stringify(transactions), context);
          } else {
            // No secondary AI service available
            throw deepseekError;
          }
        }
      }
      
      // Log sample of AI response
      logSampleTransactions(aiProcessedData, "SAMPLE AI PROCESSED TRANSACTION");
      
      if (!aiProcessedData || !Array.isArray(aiProcessedData)) {
        console.log("AI processing failed or returned invalid data. Retrying with retry limits...");
        // Instead of falling back to basic formatting, we'll throw an error that will be caught
        // and retried at a higher level
        throw new Error("AI processing failed or returned invalid data");
      }
      
      // Merge AI processed data with original transaction data to preserve all fields
      const formattedTransactions = mergeTransactionData(transactions, aiProcessedData);
      
      console.log("Successfully applied AI formatting to transactions");
      // Filter out any invalid transactions
      return filterInvalidTransactions(formattedTransactions);
    } catch (aiError) {
      console.error("Error in AI processing:", aiError);
      // If this was a retry or we couldn't process with either AI service,
      // fall back to basic formatting
      console.log("All AI processing attempts failed. Using basic formatting as last resort.");
      const basicFormatted = basicFormatting(transactions);
      // Filter out any invalid transactions
      return filterInvalidTransactions(basicFormatted);
    }
  } catch (error) {
    console.error("Error formatting transactions with AI:", error);
    // Return filtered original transactions if formatting fails completely
    return filterInvalidTransactions(transactions);
  }
}
