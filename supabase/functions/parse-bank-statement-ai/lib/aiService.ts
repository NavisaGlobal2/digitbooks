
// AI service for formatting transactions while preserving original data
import { Transaction } from './types.ts';
import { processWithAnthropic } from './anthropicProcessor.ts';
import { processWithDeepseek } from './deepseekProcessor.ts';
import { basicFormatting } from './utils/basicFormatter.ts';
import { selectAIProvider } from './utils/aiProviderSelector.ts';
import { mergeTransactionData, logSampleTransactions } from './utils/dataProcessor.ts';

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

    // Determine which AI provider to use
    const { provider, reason } = selectAIProvider(preferredProvider);
    
    // If no AI provider is available, use basic formatting
    if (provider === "none") {
      return basicFormatting(transactions);
    }
    
    try {
      // Send the ENTIRE raw transaction data to the AI model, preserving ALL original structure
      console.log("Sending RAW transaction data directly to AI without preprocessing");
      console.log(`Total transactions for AI: ${transactions.length}`);
      logSampleTransactions(transactions, "SAMPLE RAW DATA FOR AI");
      
      // Send to the selected AI service
      let aiProcessedData;
      if (provider === "anthropic") {
        aiProcessedData = await processWithAnthropic(JSON.stringify(transactions), context);
      } else if (provider === "deepseek") {
        aiProcessedData = await processWithDeepseek(JSON.stringify(transactions), context);
      }
      
      // Log sample of AI response
      logSampleTransactions(aiProcessedData, "SAMPLE AI PROCESSED TRANSACTION");
      
      if (!aiProcessedData || !Array.isArray(aiProcessedData)) {
        console.log("AI processing failed or returned invalid data. Falling back to basic formatting.");
        return basicFormatting(transactions);
      }
      
      // Merge AI processed data with original transaction data to preserve all fields
      const formattedTransactions = mergeTransactionData(transactions, aiProcessedData);
      
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
