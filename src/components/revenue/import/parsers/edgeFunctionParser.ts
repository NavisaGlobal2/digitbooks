
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
      
      // Create a job record
      const { data: jobData, error: jobError } = await supabase
        .from('revenue_import_jobs')
        .insert({
          user_id: authData.session.user.id,
          file_path: filePath,
          file_name: fileName,
          status: 'pending'
        })
        .select('id')
        .single();
      
      if (jobError) {
        console.error("Job creation error:", jobError);
        onError(`Database error: ${jobError.message}`);
        return [];
      }

      // Call the serverless function with error handling
      const { data, error } = await supabase.functions.invoke(endpoint, {
        body: {
          job_id: jobData.id,
          context
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        onError(`Server error: ${error.message}`);
        return [];
      }

      if (!data || !data.transactions || !Array.isArray(data.transactions)) {
        // Update job status
        await supabase
          .from('revenue_import_jobs')
          .update({
            status: 'failed',
            error: 'Invalid response from server',
            updated_at: new Date().toISOString()
          })
          .eq('id', jobData.id);
            
        onError("Invalid response from server. No transactions found in the response.");
        return [];
      }

      console.log(`Raw transaction data from server:`, data.transactions);
      console.log(`Transaction count from server: ${data.transactions.length}`);

      // Generate a batch ID as a proper UUID to avoid database errors
      const batchId = data.batchId || jobData.id;

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
      
      // Update job status and data
      await supabase
        .from('revenue_import_jobs')
        .update({
          status: 'completed',
          extracted_data: data.transactions,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', jobData.id);
      
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
