
import { ParsedTransaction } from "../types";
import { 
  getAuthToken,
  MAX_RETRIES,
  handleRetry,
  handleEdgeFunctionError,
  handleCSVFallback,
  trackSuccessfulConnection,
  trackFailedConnection
} from "./index";

/**
 * Parse a bank statement file via the Supabase edge function
 */
export const parseViaEdgeFunction = async (
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  preferredProvider: string = "anthropic"
) => {
  try {
    console.log(`Parsing file via edge function: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
    
    // Get auth token
    const { token, error: authError } = await getAuthToken();
    if (authError || !token) {
      return onError(authError || "Authentication error occurred");
    }
    
    // Create FormData with file and provider preference
    const formData = new FormData();
    formData.append("file", file);
    
    if (preferredProvider) {
      formData.append("preferredProvider", preferredProvider);
      console.log(`Using preferred AI provider: ${preferredProvider}`);
    }
    
    console.log(`Calling parse-bank-statement-ai edge function with ${file.name}`);
    
    // Use a hardcoded URL format since we know the project ID
    const supabaseUrl = "https://naxmgtoskeijvdofqyik.supabase.co";
    
    // Implement retry logic
    let retryCount = 0;
    let lastError = null;

    while (retryCount <= MAX_RETRIES) {
      const { result, error, exhausted } = await handleRetry(
        async () => {
          trackSuccessfulConnection();
          
          // Custom fetch to edge function
          const response = await fetch(
            `${supabaseUrl}/functions/v1/parse-bank-statement-ai`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
              body: formData,
            }
          );
          
          console.log(`Edge function response status: ${response.status}`);
          
          if (!response.ok) {
            const errorData = await handleResponseError(response);
            throw errorData;
          }
          
          return response.json();
        },
        retryCount
      );
      
      // If successful, process the result
      if (result) {
        return processSuccessfulResult(result, onSuccess);
      }
      
      // Handle error
      lastError = error;
      const { message, shouldRetry, errorType } = handleEdgeFunctionError(error, error.status);
      
      // For CSV files, try fallback if it's a network error
      if (error.message && error.message.includes("Failed to fetch") && file.name.toLowerCase().endsWith('.csv')) {
        const fallbackHandled = await handleCSVFallback(file, onSuccess, onError, error);
        if (fallbackHandled) {
          return true;
        }
      }
      
      // Break the loop if we shouldn't retry or if we've exhausted all retries
      if (!shouldRetry || exhausted) {
        trackFailedConnection(errorType);
        return onError(message);
      }
      
      // Increment retry counter
      retryCount++;
    }
    
    // If we've exhausted all retries, return the last error
    trackFailedConnection('max_retries_exceeded');
    return onError(
      lastError?.message || "Failed to process file after multiple attempts. Please try again later."
    );
    
  } catch (error: any) {
    console.error("Error in parseViaEdgeFunction:", error);
    
    trackFailedConnection('unexpected_error');
    
    return onError(error.message || "Failed to process file with server");
  }
};

/**
 * Process a successful response from the edge function
 */
const processSuccessfulResult = (
  result: any, 
  onSuccess: (transactions: ParsedTransaction[]) => void
): boolean => {
  console.log("Edge function result:", result);
  
  if (!result.success) {
    trackFailedConnection('processing_error');
    throw new Error(result.error || "Unknown error processing file");
  }
  
  if (!result.transactions || !Array.isArray(result.transactions) || result.transactions.length === 0) {
    trackFailedConnection('no_transactions');
    throw new Error("No transactions were found in the uploaded file");
  }
  
  console.log(`Successfully parsed ${result.transactions.length} transactions`);
  
  // Process the transactions
  const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    type: tx.type || (tx.amount < 0 ? "debit" : "credit"),
    selected: tx.type === "debit", // Pre-select debits by default
    category: tx.category || "",
    source: tx.source || ""
  }));
  
  onSuccess(transactions);
  return true;
};

/**
 * Handle error response from the edge function
 */
const handleResponseError = async (response: Response): Promise<any> => {
  console.error(`Server responded with status: ${response.status}`);
  let errorMessage = "Error processing file on server";
  
  try {
    // Try to parse error response as JSON
    const errorText = await response.text();
    console.error("Error text:", errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If parsing fails, use the raw error text
      errorMessage = errorText || errorMessage;
    }
  } catch (e) {
    console.error("Failed to read error response:", e);
  }
  
  return { 
    message: errorMessage, 
    status: response.status 
  };
};
