
import { trackFailedConnection } from "./connectionStats";

/**
 * Handle and categorize errors from edge function calls
 */
export const handleEdgeFunctionError = (
  error: any,
  responseStatus?: number
): { 
  message: string;
  shouldRetry: boolean;
  errorType: string;
} => {
  // Network error handling
  if (error.name === "AbortError") {
    console.error("Request timed out or was aborted");
    trackFailedConnection('timeout_error');
    return {
      message: "Request timed out. The server might be overloaded. Please try again later.",
      shouldRetry: true,
      errorType: 'timeout_error'
    };
  }
  
  if (error.message && error.message.includes("Failed to fetch")) {
    console.error("Network error detected. This may be due to CORS, network connectivity, or the edge function being unavailable.");
    console.error("Error details:", error);
    
    trackFailedConnection('network_error');
    return {
      message: "Could not connect to the server. Please check your internet connection and try again.",
      shouldRetry: true,
      errorType: 'network_error'
    };
  }
  
  // Authentication error
  if (responseStatus === 401) {
    console.error("Authentication error: User session may be invalid or expired");
    trackFailedConnection('unauthorized');
    return {
      message: "Authentication error. Please sign in again and try one more time.",
      shouldRetry: false,
      errorType: 'unauthorized'
    };
  }

  // Server error
  if (responseStatus && responseStatus >= 500) {
    console.error(`Server error with status code: ${responseStatus}`);
    trackFailedConnection(`http_${responseStatus}`);
    return {
      message: `Server error (${responseStatus}). Please try again later.`,
      shouldRetry: true,
      errorType: `http_${responseStatus}`
    };
  }
  
  // Default error
  console.error("Unknown error:", error);
  trackFailedConnection('other_error');
  return {
    message: error.message || "Unknown error occurred",
    shouldRetry: false,
    errorType: 'other_error'
  };
};
