
import { ParsedTransaction } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = 'anthropic'
): Promise<void> => {
  try {
    // Check authentication first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      throw new Error("Authentication required. Please sign in to continue.");
    }

    // Create form data with the file and preferences
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preferredProvider', preferredProvider);
    formData.append('fileName', file.name);
    formData.append('authToken', sessionData.session.access_token);

    console.log(`Processing ${file.name} (${file.type}, ${file.size} bytes) via edge function`);

    // Call the edge function
    const { data, error } = await supabase.functions.invoke('parse-bank-statement-ai', {
      body: formData,
    });

    if (error) {
      console.error("Edge function error:", error);
      const handled = onError(error.message || "Error processing file");
      return;
    }

    if (!data || !data.transactions || !Array.isArray(data.transactions) || data.transactions.length === 0) {
      const handled = onError("No transactions found in file");
      return;
    }

    // Transform the response to match our expected ParsedTransaction format
    const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
      id: uuidv4(),
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount), // Ensure positive amount
      type: tx.type,
      selected: tx.type === 'debit', // Pre-select debit transactions
      categorySuggestion: tx.type === 'debit' ? {
        category: guessCategoryFromDescription(tx.description),
        confidence: 0.7
      } : undefined
    }));

    // Send the transactions to the caller
    onSuccess(parsedTransactions);
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};

/**
 * Basic logic to guess expense category from transaction description
 */
function guessCategoryFromDescription(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('food') || lowerDesc.includes('restaurant') || 
      lowerDesc.includes('cafe') || lowerDesc.includes('coffee') ||
      lowerDesc.includes('uber eats') || lowerDesc.includes('doordash')) {
    return 'food';
  }
  
  if (lowerDesc.includes('uber') || lowerDesc.includes('lyft') || 
      lowerDesc.includes('taxi') || lowerDesc.includes('transport') ||
      lowerDesc.includes('train') || lowerDesc.includes('subway')) {
    return 'transportation';
  }
  
  if (lowerDesc.includes('amazon') || lowerDesc.includes('walmart') || 
      lowerDesc.includes('target') || lowerDesc.includes('purchase')) {
    return 'shopping';
  }
  
  if (lowerDesc.includes('rent') || lowerDesc.includes('mortgage') || 
      lowerDesc.includes('apartment') || lowerDesc.includes('housing')) {
    return 'housing';
  }
  
  if (lowerDesc.includes('phone') || lowerDesc.includes('internet') || 
      lowerDesc.includes('wireless') || lowerDesc.includes('broadband')) {
    return 'utilities';
  }
  
  // Default
  return 'other';
}
