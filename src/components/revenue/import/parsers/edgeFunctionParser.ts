
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { RevenueSource } from "@/types/revenue";
import { 
  extractDate, 
  extractDescription, 
  extractAmount, 
  determineTransactionType 
} from "./utils/formatters";
import { withRetry } from "@/components/expenses/upload/parsers/edge-function/retryHandler";

// Reuse the same edge function parser as expenses but adapt it for revenue context
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  useAIFormatting: boolean = true,
  context: 'revenue' | 'expense' = 'revenue'
): Promise<void> => {
  try {
    // Import and use the same edge function parser from expenses
    const { parseViaEdgeFunction: parseWithExpenseFunction } = await import('@/components/expenses/upload/parsers/edgeFunctionParser');
    
    // Call the expense parser but specify 'revenue' as the context
    await parseWithExpenseFunction(
      file,
      (transactions, responseData) => {
        // Apply revenue-specific transformations
        const revenueTransactions = transformForRevenueContext(transactions);
        onSuccess(revenueTransactions);
      },
      onError,
      resetProgress,
      completeProgress,
      false, // isCancelled parameter
      undefined, // setIsWaitingForServer
      'anthropic', // Default AI provider
      useAIFormatting // Use AI formatting
      // Note: The context parameter is handled differently - we'll pass it in the request body
    );
  } catch (error: any) {
    // Reset progress if provided
    if (resetProgress) {
      resetProgress();
    }
    
    console.error(`Error in revenue parseViaEdgeFunction:`, error);
    onError(error.message || "Unexpected error processing file");
  }
};

/**
 * Transform generic transactions into revenue-specific transactions
 */
function transformForRevenueContext(transactions: any[]): ParsedTransaction[] {
  return transactions
    .filter((tx: any) => {
      // Skip rows that don't have proper data
      if (!tx || typeof tx !== 'object') {
        return false;
      }
      
      // For revenue, we only want credit transactions
      const type = determineTransactionType(tx);
      return type === 'credit';
    })
    .map((tx: any) => {
      // Extract transaction details
      const txDate = extractDate(tx);
      const description = extractDescription(tx);
      const amount = extractAmount(tx);
      
      return {
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: txDate,
        description: description,
        amount: amount,
        type: "credit" as const,
        selected: true,
        source: tx.source || undefined,
        // Preserve original data
        originalDate: tx.originalDate || tx.date,
        originalAmount: tx.originalAmount || tx.amount,
        preservedColumns: tx.preservedColumns || {}
      };
    });
}

/**
 * Legacy functions maintained for backward compatibility
 */
function transformRevenueTransactions(transactions: any[]): ParsedTransaction[] {
  return transformForRevenueContext(transactions);
}

function transformExpenseTransactions(transactions: any[]): ParsedTransaction[] {
  return transactions
    .filter((tx: any) => {
      // Skip rows that don't have proper data
      if (!tx || typeof tx !== 'object') {
        return false;
      }
      
      // For expenses, we only want debit transactions
      const type = determineTransactionType(tx);
      return type === 'debit';
    })
    .map((tx: any) => {
      // Extract transaction details
      const txDate = extractDate(tx);
      const description = extractDescription(tx);
      const amount = extractAmount(tx);
      
      return {
        id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
        date: txDate,
        description: description,
        amount: amount,
        type: "debit" as const,
        selected: true,
        // Preserve original data
        originalDate: tx.originalDate || tx.date,
        originalAmount: tx.originalAmount || tx.amount,
        preservedColumns: tx.preservedColumns || {}
      };
    });
}
