
import { getApiEndpoint, getAuthToken, API_BASE } from "./apiHelpers";
import { mapApiResponseTransactions, mapDatabaseTransactions } from "./transactionMapper";
import { ParsedTransaction } from "../types";
import { ApiResponse } from "./types";

export const parseWithEdgeFunction = async (
  file: File,
  setIsWaitingForServer: (waiting: boolean) => void
): Promise<ParsedTransaction[]> => {
  try {
    setIsWaitingForServer(true);
    
    // Get auth token
    const token = await getAuthToken();
    
    if (!token) {
      throw new Error("Authentication required. Please sign in and try again.");
    }
    
    // Prepare form data for the API call
    const formData = new FormData();
    formData.append('file', file);
    
    const endpoint = getApiEndpoint(file);
    console.log(`Processing ${file.name} using endpoint: ${endpoint}`);
    
    // Make the API call
    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    // Parse the response
    const responseData = await response.json() as ApiResponse;
    
    // Handle API errors
    if (responseData.success === false) {
      throw new Error(responseData.message || "Unknown error processing statement");
    }
    
    // Handle the new API format with statement_id
    if (responseData.success && responseData.statement_id && !responseData.transactions) {
      console.log(`Statement processed with ID: ${responseData.statement_id}, fetching transactions from database`);
      return await mapDatabaseTransactions(responseData.statement_id);
    }
    
    // Handle the legacy response format with inline transactions
    if (responseData.transactions && Array.isArray(responseData.transactions)) {
      console.log(`Received ${responseData.transactions.length} transactions from API`);
      return mapApiResponseTransactions(responseData.transactions, responseData.batchId);
    }
    
    throw new Error("Invalid response format from server");
  } catch (error) {
    console.error("Error in parseWithEdgeFunction:", error);
    throw error;
  } finally {
    setIsWaitingForServer(false);
  }
};
