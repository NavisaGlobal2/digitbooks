
import { ParsedTransaction } from "../types";
import { ApiResponse } from "./types";
import { API_BASE, getAuthToken, getApiEndpoint } from "./apiHelpers";
import { mapDatabaseTransactions, mapApiResponseTransactions } from "./transactionMapper";
import { toast } from "sonner";

export const parseWithEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean
): Promise<ParsedTransaction[]> => {
  try {
    // Create a form to send the file
    const formData = new FormData();
    formData.append("file", file);
    
    // Get the appropriate endpoint based on file type
    const endpoint = getApiEndpoint(file);
    
    console.log(`Sending file to API endpoint: ${API_BASE}/${endpoint}`);
    
    // Get authentication token
    const accessToken = await getAuthToken();
    if (!accessToken) {
      const errorMsg = "You need to be signed in to use this feature. Please sign in and try again.";
      onError(errorMsg);
      return [];
    }

    // Call the API endpoint
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error:", response.status, errorText);
      
      // Check for specific API errors
      if (errorText.includes("ANTHROPIC_API_KEY") || 
          errorText.includes("Anthropic API") ||
          errorText.includes("exceeded") ||
          errorText.includes("rate limit")) {
        const errorMsg = "API key error: Either the key is not configured, invalid, or you've exceeded your rate limit. Please contact your administrator.";
        onError(errorMsg);
        return [];
      }
      
      // Check for authentication errors
      if (errorText.includes("Auth session") ||
          errorText.includes("authentication") ||
          errorText.includes("unauthorized")) {
        const errorMsg = "Authentication error: Please try signing out and signing back in to refresh your session.";
        onError(errorMsg);
        return [];
      }
      
      onError(`Server error: ${errorText || response.statusText}`);
      return [];
    }

    // Parse the response as JSON
    const apiResponse = await response.json();
    const typedData = apiResponse as ApiResponse;

    // Handle the new API response format
    if (typedData.success === false) {
      onError(`API Error: ${typedData.message || "Unknown error processing statement"}`);
      return [];
    }

    // Check if we need to fetch transactions from the database
    if (!typedData.transactions && typedData.statement_id) {
      const parsedTransactions = await mapDatabaseTransactions(typedData.statement_id);
      
      if (parsedTransactions.length === 0) {
        onError("No transactions found in the processed statement.");
        return [];
      }
      
      // Call success callback with transactions
      onSuccess(parsedTransactions);
      
      if (parsedTransactions.length > 5) {
        toast.success(`Parsed ${parsedTransactions.length} transactions from your statement`);
      }
      
      return parsedTransactions;
    }

    // Handle the legacy response format
    const transactions = typedData.transactions || [];
    
    // Map the server response to our ParsedTransaction type
    const batchId = typedData.batchId || typedData.statement_id;
    const parsedTransactions = mapApiResponseTransactions(transactions, batchId);

    // Filter transactions if needed
    const filteredTransactions = parsedTransactions.filter(tx => 
      tx.type === 'debit' || parseFloat(tx.amount.toString()) < 0
    );
    
    if (filteredTransactions.length === 0) {
      onError("No expense transactions found in the statement. Only expense transactions can be imported.");
      return [];
    }

    // Call success callback with transactions
    onSuccess(filteredTransactions);
    
    // Only show toast for significant number of transactions
    if (filteredTransactions.length > 5) {
      toast.success(`Parsed ${filteredTransactions.length} expenses from your statement`);
    }
    
    return filteredTransactions;
  } catch (error) {
    console.error("Error in parseWithEdgeFunction:", error);
    onError(`Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return [];
  }
};
