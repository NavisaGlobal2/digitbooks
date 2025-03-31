
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
    formData.append('useAIFormatting', useAIFormatting.toString()); // Explicitly enable AI formatting
    formData.append('preferredProvider', 'anthropic'); // Specifically request Anthropic for formatting

    console.log(`Processing ${file.name} for revenue parsing via edge function with AI formatting ${useAIFormatting ? 'enabled' : 'disabled'}`);

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
    console.log("Raw transactions from edge function:", data.transactions.slice(0, 2));
    console.log("AI formatting applied:", data.formattingApplied || false);

    // Complete progress if provided
    if (completeProgress) {
      completeProgress();
    }

    // Transform the raw transactions into the expected format for revenue import
    const revenueTransactions = data.transactions
      .filter((tx: any) => {
        // Skip rows that don't have proper data
        if (!tx || !tx.preservedColumns) {
          return false;
        }
        
        // Extract and check for credit transactions
        const creditAmount = extractCreditAmount(tx);
        return creditAmount > 0;
      })
      .map((tx: any) => {
        // Extract transaction details
        const txDate = extractDate(tx);
        const description = extractDescription(tx);
        const amount = extractAmount(tx);
        
        // Create a source suggestion based on the description
        // Use the AI-suggested source if available
        const sourceSuggestion = tx.sourceSuggestion || suggestRevenueSource(description);
        
        return {
          id: tx.id || `tx-${Math.random().toString(36).substr(2, 9)}`,
          date: txDate,
          description: description,
          amount: amount,
          type: "credit" as const,
          selected: true,
          sourceSuggestion,
          // Preserve original data
          originalDate: tx.originalDate || tx.date,
          originalAmount: tx.originalAmount || tx.amount,
          preservedColumns: tx.preservedColumns || {}
        };
      });

    console.log(`Found ${revenueTransactions.length} revenue transactions`);
    console.log("Sample formatted transactions:", revenueTransactions.slice(0, 2));
    
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

// Helper function to extract date from transaction
function extractDate(tx: any): Date {
  try {
    // First try to use the AI-formatted date if available
    if (tx.date) {
      const parsedDate = new Date(tx.date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    
    if (tx.preservedColumns) {
      // Try to find date fields in preserved columns
      const possibleDateFields = [
        "STATEMENT OF ACCOUNT",
        "Date",
        "Transaction Date",
        "VALUE DATE",
        "POSTING DATE"
      ];
      
      for (const field of possibleDateFields) {
        if (tx.preservedColumns[field]) {
          const dateStr = tx.preservedColumns[field];
          
          // Handle date formats like "12-Aug-2024"
          if (dateStr && /\d{1,2}-[A-Za-z]{3}-\d{4}/.test(dateStr)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap: {[key: string]: number} = {
              'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5, 
              'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
            };
            return new Date(parseInt(year), monthMap[month], parseInt(day));
          }
          
          // Try standard date parsing
          const parsedDate = new Date(dateStr);
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate;
          }
        }
      }
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }
  
  // Default to current date if no valid date found
  return new Date();
}

// Helper function to extract description from transaction
function extractDescription(tx: any): string {
  // First try to use the AI-formatted description if available
  if (tx.description) {
    return tx.description;
  }
  
  if (tx.preservedColumns) {
    // Try common description fields
    const possibleDescFields = [
      "NARRATION", 
      "Description", 
      "PARTICULARS", 
      "__EMPTY", 
      "Remarks", 
      "Transaction Description"
    ];
    
    for (const field of possibleDescFields) {
      if (tx.preservedColumns[field] && typeof tx.preservedColumns[field] === 'string') {
        return tx.preservedColumns[field].trim();
      }
    }
  }
  
  return "Unknown transaction";
}

// Helper function to extract credit amount from transaction
function extractCreditAmount(tx: any): number {
  // First check if we already have a processed amount from AI formatting
  if (tx.amount && tx.type === 'credit') {
    return parseFloat(tx.amount);
  }
  
  if (tx.preservedColumns) {
    // Try common credit amount fields
    const possibleCreditFields = [
      "CREDIT", 
      "__EMPTY_3", 
      "Credit Amount",
      "CREDIT AMOUNT", 
      "INFLOW"
    ];
    
    for (const field of possibleCreditFields) {
      if (tx.preservedColumns[field]) {
        const amountStr = tx.preservedColumns[field].toString();
        if (amountStr) {
          // Clean the string and parse as float
          const cleanAmount = amountStr.replace(/[^\d.-]/g, '');
          if (cleanAmount) {
            return parseFloat(cleanAmount);
          }
        }
      }
    }
  }
  
  return 0;
}

// Helper function to extract amount (handles both credit and debit)
function extractAmount(tx: any): number {
  // First try to use the AI-formatted amount if available
  if (typeof tx.amount === 'number') {
    return Math.abs(tx.amount); // Convert negative to positive for revenue
  }
  
  const creditAmount = extractCreditAmount(tx);
  if (creditAmount > 0) {
    return creditAmount;
  }
  
  return 0;
}

// Helper function to suggest revenue source based on description
function suggestRevenueSource(description: string): { source: RevenueSource, confidence: number } | undefined {
  if (!description) {
    return undefined;
  }
  
  const desc = description.toLowerCase();
  
  // Simple rule-based source suggestions
  if (desc.includes('loan') || desc.includes('credit') || desc.includes('advance')) {
    return { source: 'other', confidence: 0.7 };
  } else if (desc.includes('sale') || desc.includes('payment') || desc.includes('invoice')) {
    return { source: 'sales', confidence: 0.8 };
  } else if (desc.includes('interest') || desc.includes('dividend')) {
    return { source: 'investments', confidence: 0.9 };
  } else if (desc.includes('consult') || desc.includes('service')) {
    return { source: 'consulting', confidence: 0.8 };
  } else if (desc.includes('rent') || desc.includes('lease') || desc.includes('property')) {
    return { source: 'rental', confidence: 0.9 };
  } else if (desc.includes('donation') || desc.includes('gift')) {
    return { source: 'donations', confidence: 0.9 };
  } else if (desc.includes('grant')) {
    return { source: 'grants', confidence: 0.9 };
  } else if (desc.includes('royalty') || desc.includes('license')) {
    return { source: 'royalties', confidence: 0.8 };
  }
  
  // Default suggestion with lower confidence
  return { source: 'sales', confidence: 0.6 };
}
