
import { ParsedTransaction } from "./types";
import { supabase } from "@/integrations/supabase/client";

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

    // Get the token for authorizing the function call
    const token = sessionData.session.access_token;

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

    // Send the transactions to the caller
    onSuccess(data.transactions as ParsedTransaction[]);
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    onError(error.message || "Unexpected error processing file");
  }
};
