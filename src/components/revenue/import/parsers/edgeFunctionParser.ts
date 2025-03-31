
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

    // Filter to only include credit (positive amount) transactions for revenue
    // Also ensure proper data mapping and transformation with correct types
    const revenueTransactions = data.transactions
      .filter((tx: any) => {
        // Check if the transaction has actual data (not just header or summary rows)
        const hasValidData = tx.preservedColumns && 
          (tx.amount > 0 || 
           (tx.preservedColumns['__EMPTY'] && tx.preservedColumns['__EMPTY'].includes('₦')));
        
        // For revenue, we want credit transactions or positive amounts
        return hasValidData && (tx.type === 'credit' || tx.amount > 0);
      })
      .map((tx: any) => {
        // Extract the actual date and amount from preserved columns
        let extractedDate = '';
        let extractedAmount = 0;
        let extractedDescription = '';
        
        // Check if this is from the Excel format we're seeing
        if (tx.preservedColumns) {
          // Extract date from first column if it exists and matches date pattern
          const datePattern = /\d{2}\/\d{2}\/\d{2}/;
          const dateColumn = tx.preservedColumns["JOHN OLUSEYE ONIFADE\n13 ILUPEJU ESTATE AS- SALLAM SECONDARY SCHOOL, IBADAN, OYO"];
          
          if (dateColumn && datePattern.test(dateColumn)) {
            extractedDate = dateColumn;
          }
          
          // Extract amount - look for the ₦ symbol in columns
          if (tx.preservedColumns["__EMPTY"]) {
            const amountText = tx.preservedColumns["__EMPTY"];
            if (typeof amountText === 'string' && amountText.includes('₦')) {
              extractedAmount = parseFloat(amountText.replace('₦', '').replace(/,/g, '').trim());
            }
          }
          
          // Extract description from transfer details if available
          const descriptionSources = [
            tx.preservedColumns["__EMPTY_7"], 
            tx.preservedColumns["__EMPTY_4"]
          ];
          
          extractedDescription = descriptionSources
            .filter(Boolean)
            .join(" - ")
            .trim() || "Unknown transaction";
        }

        // Make sure source is properly typed as RevenueSource
        const source = tx.sourceSuggestion?.source as RevenueSource | undefined;
        
        // Format the transaction for revenue
        return {
          id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
          date: extractedDate ? new Date(extractedDate) : new Date(),
          description: extractedDescription || tx.description || "Unknown transaction",
          amount: extractedAmount || Math.abs(tx.amount || 0),
          type: "credit" as const,
          selected: true,
          source: source,
          sourceSuggestion: tx.sourceSuggestion ? {
            source: tx.sourceSuggestion.source as RevenueSource,
            confidence: tx.sourceSuggestion.confidence
          } : undefined,
          // Preserve original data
          originalDate: tx.originalDate || extractedDate || tx.date,
          originalAmount: tx.originalAmount || extractedAmount || tx.amount,
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
