
import { trackFailedConnection } from "./connectionStats";
import { ParsedTransaction } from "../types";
import { handleCSVFallback } from "./fallbackHandler";

/**
 * Handle network-related errors
 */
export const handleNetworkError = async (
  error: any, 
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  endpoint: string
): Promise<boolean> => {
  console.log('Network-related error detected, will attempt retry if retries remaining');
  trackFailedConnection('network_error', error, endpoint);
  
  // For CSV files, try fallback immediately for network errors
  if (file.name.toLowerCase().endsWith('.csv')) {
    console.log('CSV file detected, attempting local fallback');
    return await handleCSVFallback(file, onSuccess, onError, error);
  }
  
  return false;
};

/**
 * Handle non-network errors
 */
export const handleOtherErrors = async (
  error: any, 
  file: File,
  onSuccess: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => boolean,
  endpoint: string
): Promise<boolean> => {
  // Handle authentication errors
  if (error.status === 401 || 
      (error.message && error.message.toLowerCase().includes('auth'))) {
    console.error("Authentication error:", error);
    trackFailedConnection('auth_error', error, endpoint);
    return onError("Authentication error. Please sign in again and try once more.");
  }
  
  // Handle server errors
  if (error.status && error.status >= 500) {
    console.error("Server error:", error);
    trackFailedConnection('server_error', error, endpoint);
    
    // For CSV files with server errors, try fallback
    if (file.name.toLowerCase().endsWith('.csv')) {
      console.log('Server error with CSV file, attempting local fallback');
      return await handleCSVFallback(file, onSuccess, onError, error);
    }
    
    return onError(`Server error (${error.status}). Please try again later.`);
  }
  
  // Handle all other errors
  console.error("Other error:", error);
  trackFailedConnection('other_error', error, endpoint);
  return onError(error.message || "Error processing file");
};
