
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  context: "revenue" | "expense" = "revenue"
): Promise<ParsedTransaction[]> => {
  try {
    // Create a form to send the file
    const formData = new FormData();
    formData.append("file", file);
    formData.append("context", context); // Add context for the parser to identify revenue transactions
    formData.append("isRealData", "true"); // Flag to tell the AI this is real data
    
    const endpoint = 'parse-bank-statement-ai';

    console.log(`Sending file to edge function for ${context} processing: ${endpoint}`);
    
    // Check authentication status before making the request
    const { data: authData } = await supabase.auth.getSession();
    if (!authData.session) {
      const errorMsg = "You need to be signed in to use this feature. Please sign in and try again.";
      onError(errorMsg);
      return [];
    }
    
    try {
      // First upload file to storage for more reliable processing
      const filePath = `${context}_imports/${authData.session.user.id}/${uuidv4()}`;
      const fileName = file.name;
      
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('revenue_imports')
        .upload(filePath, file);
        
      if (storageError) {
        console.error("Storage upload error:", storageError);
        onError(`Storage error: ${storageError.message}`);
        return [];
      }
      
      // Generate a job tracking ID
      const jobId = uuidv4();
      const batchId = jobId;

      // Call the serverless function with error handling
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          filePath,
          fileName,
          context,
          jobId,
          processingMode: file.name.toLowerCase().endsWith('.pdf') ? 'full_extraction' : 'standard',
          fileType: file.type,
          useGoogleVision: file.name.toLowerCase().endsWith('.pdf') // Enable Google Vision for PDFs
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        onError(`Server error: ${error.message}`);
        return [];
      }

      if (!data || !data.transactions || !Array.isArray(data.transactions)) {
        onError("Invalid response from server. No transactions found in the response.");
        return [];
      }

      console.log(`Raw transaction data from server:`, data.transactions);
      console.log(`Transaction count from server: ${data.transactions.length}`);

      // Map the server response to our ParsedTransaction type
      const parsedTransactions: ParsedTransaction[] = data.transactions.map((tx: any) => ({
        id: `transaction-${Math.random().toString(36).substr(2, 9)}`,
        date: new Date(tx.date),
        description: tx.description,
        amount: Math.abs(parseFloat(tx.amount)), // Store as positive number
        type: tx.type || (parseFloat(tx.amount) < 0 ? 'debit' : 'credit'),
        source: tx.source || null,
        selected: tx.type === 'credit', // Preselect credits (revenue)
        batchId,
        sourceSuggestion: tx.sourceSuggestion || null, // Include AI source suggestions
      }));

      console.log(`Parsed ${parsedTransactions.length} transactions with batch ID: ${batchId}`);

      // Only include transactions based on context
      const filteredTransactions = context === 'revenue' 
        ? parsedTransactions.filter(tx => tx.type === 'credit')
        : parsedTransactions.filter(tx => tx.type === 'debit');
      
      if (filteredTransactions.length === 0) {
        onError(`No ${context} transactions found in the statement.`);
        return [];
      }

      console.log(`Found ${filteredTransactions.length} ${context} transactions to display`);

      // Call success callback with transactions
      onSuccess(filteredTransactions);
      
      // Show success message with the transaction count
      toast.success(`Successfully parsed ${filteredTransactions.length} ${context} entries from your statement`);
      
      return filteredTransactions;
    } catch (supabaseError: any) {
      console.error("Supabase error:", supabaseError);
      if (supabaseError.message?.includes("Network")) {
        onError("Network error when calling the server. Please check your internet connection and try again.");
      } else {
        onError(`Error calling server: ${supabaseError.message || "Unknown error"}`);
      }
      return [];
    }
  } catch (error) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};
