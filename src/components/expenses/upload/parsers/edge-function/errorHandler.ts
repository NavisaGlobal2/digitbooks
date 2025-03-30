
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
  details?: any;
} => {
  const errorSource = error?.message || 'unknown_error';
  
  // CORS error detection
  if (error.message && (
    error.message.includes('CORS') || 
    error.message.includes('origin') ||
    error.message.includes('cross-origin')
  )) {
    console.error("CORS error detected:", error);
    trackFailedConnection('cors_error', errorSource);
    return {
      message: "Cross-Origin Request Blocked. This is likely a server configuration issue. Please try again later.",
      shouldRetry: false,
      errorType: 'cors_error',
      details: { message: error.message, stack: error.stack }
    };
  }
  
  // Network error handling
  if (error.name === "AbortError") {
    console.error("Request timed out or was aborted");
    trackFailedConnection('timeout_error', errorSource);
    return {
      message: "Request timed out. The server might be overloaded. Please try again later.",
      shouldRetry: true,
      errorType: 'timeout_error',
      details: { name: error.name, message: error.message }
    };
  }
  
  if (error.message && error.message.includes("Failed to fetch")) {
    console.error("Network error detected. This may be due to CORS, network connectivity, or the edge function being unavailable.");
    console.error("Error details:", error);
    
    trackFailedConnection('network_error', errorSource);
    return {
      message: "Could not connect to the server. Please check your internet connection and try again.",
      shouldRetry: true,
      errorType: 'network_error',
      details: { message: error.message, stack: error.stack }
    };
  }
  
  // Authentication error
  if (responseStatus === 401) {
    console.error("Authentication error: User session may be invalid or expired");
    trackFailedConnection('unauthorized', errorSource);
    return {
      message: "Authentication error. Please sign in again and try one more time.",
      shouldRetry: false,
      errorType: 'unauthorized',
      details: { status: responseStatus }
    };
  }

  // Server error
  if (responseStatus && responseStatus >= 500) {
    console.error(`Server error with status code: ${responseStatus}`);
    trackFailedConnection(`http_${responseStatus}`, errorSource);
    return {
      message: `Server error (${responseStatus}). Please try again later.`,
      shouldRetry: true,
      errorType: `http_${responseStatus}`,
      details: { status: responseStatus }
    };
  }
  
  // Default error
  console.error("Unknown error:", error);
  trackFailedConnection('other_error', errorSource);
  return {
    message: error.message || "Unknown error occurred",
    shouldRetry: false,
    errorType: 'other_error',
    details: { error: JSON.stringify(error) }
  };
};
