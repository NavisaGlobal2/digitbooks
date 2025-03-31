
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { RevenueSource } from "@/types/revenue";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  resetProgress?: () => void,
  completeProgress?: () => void,
  useAIFormatting: boolean = true
): Promise<void> => {
  try {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Create form data with the file
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('context', 'revenue'); // Specific context for revenue parsing
    formData.append('useAIFormatting', useAIFormatting.toString());

    console.log(`Processing ${file.name} for revenue parsing via edge function`);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions)) {
      onError("No transactions found in file");
      return;
    }

    // Log the raw transactions data to debug
    console.log("Raw transactions data from edge function:", data.transactions.slice(0, 2));

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Process the transactions for revenue
    const revenueTransactions = data.transactions
      .filter((tx: any) => {
        // Skip header/summary rows or rows without transaction data
        if (!tx || tx.description === "Row 1" || tx.description === "Row 2") {
          return false;
        }
        
        // Look for actual transaction data in preserved columns
        if (tx.preservedColumns) {
          const txnDate = tx.preservedColumns["STATEMENT OF ACCOUNT"];
          const remarks = tx.preservedColumns["__EMPTY"];
          const credit = tx.preservedColumns["__EMPTY_3"];
          
          // Check if this looks like a real transaction row
          const hasTransactionData = 
            (txnDate && /\d{2}-\w{3}-\d{4}/.test(txnDate)) && // Date format like "12-Aug-2024"
            (remarks && remarks.length > 5) && // Some meaningful description
            (credit && /[\d,.]+/.test(credit)); // Some numeric amount
            
          return hasTransactionData && credit && parseFloat(credit.replace(/[^\d.-]/g, '')) > 0;
        }
        
        return false;
      })
      .map((tx: any) => {
        // Extract transaction details from preserved columns
        const txnDate = tx.preservedColumns["STATEMENT OF ACCOUNT"]; // e.g., "12-Aug-2024"
        const description = tx.preservedColumns["__EMPTY"] || "Unknown transaction"; // Transaction remarks
        const creditAmount = tx.preservedColumns["__EMPTY_3"] || "0"; // Credit column
        
        // Parse the date
        let date = new Date();
        try {
          if (txnDate && /\d{2}-\w{3}-\d{4}/.test(txnDate)) {
            // Convert date format from "12-Aug-2024" to ISO format
            const [day, month, year] = txnDate.split('-');
            const monthMap: {[key: string]: number} = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            date = new Date(parseInt(year), monthMap[month], parseInt(day));
          }
        } catch (e) {
          console.error("Error parsing date:", txnDate, e);
        }
        
        // Parse the amount - clean up non-numeric characters
        const amount = creditAmount ? parseFloat(creditAmount.replace(/[^\d.-]/g, '')) : 0;
        
        // Suggest a revenue source based on the description
        let sourceSuggestion: { source: RevenueSource, confidence: number } | undefined = undefined;
        
        // Simple rule-based source suggestion
        if (description) {
          const desc = description.toLowerCase();
          if (desc.includes('loan') || desc.includes('repayment')) {
            sourceSuggestion = { source: 'other' as RevenueSource, confidence: 0.7 };
          } else if (desc.includes('transfer') || desc.includes('payment')) {
            sourceSuggestion = { source: 'sales' as RevenueSource, confidence: 0.6 };
          } else if (desc.includes('interest')) {
            sourceSuggestion = { source: 'investments' as RevenueSource, confidence: 0.8 };
          } else if (desc.includes('consult')) {
            sourceSuggestion = { source: 'consulting' as RevenueSource, confidence: 0.9 };
          } else if (desc.includes('rental') || desc.includes('lease')) {
            sourceSuggestion = { source: 'rental' as RevenueSource, confidence: 0.9 };
          }
        }
        
        // Format the transaction for revenue
        return {
          id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
          date: date,
          description: description.trim(),
          amount: amount,
          type: "credit" as const,
          selected: true,
          sourceSuggestion,
          // Preserve original data
          originalDate: txnDate,
          originalAmount: creditAmount,
          preservedColumns: tx.preservedColumns || {}
        };
      });

    console.log(`Found ${revenueTransactions.length} revenue transactions out of ${data.transactions.length} total`);
    console.log("Sample formatted transactions:", revenueTransactions.slice(0, 2));
    
    // Send the filtered revenue transactions to the caller
    onSuccess(revenueTransactions);
  } catch (error: any) {
    // Reset progress if provided
    if (resetProgress) {
      resetProgress();
    }
    
    console.error("Error in parseViaEdgeFunction for revenue:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
