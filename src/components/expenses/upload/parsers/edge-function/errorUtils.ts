
/**
 * Extracts technical details from an error object for debugging
 * @param error - The error object
 * @returns A string with technical error details
 */
export const getTechnicalErrorDetails = (error: unknown): string => {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  
  return String(error);
};

/**
 * Creates a user-friendly error message from technical error
 * @param error - The error object
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  const errorMessage = String(error);
  
  // Check for common connection issues
  if (errorMessage.includes("Failed to fetch") || 
      errorMessage.includes("NetworkError")) {
    return "Unable to connect to the server. Please check your internet connection and try again.";
  }
  
  // Check for authentication issues
  if (errorMessage.includes("auth") || 
      errorMessage.includes("token") || 
      errorMessage.includes("unauthorized")) {
    return "Authentication error. Please sign in again and try once more.";
  }
  
  // Default message
  return "An error occurred while processing your request. Please try again later.";
};
