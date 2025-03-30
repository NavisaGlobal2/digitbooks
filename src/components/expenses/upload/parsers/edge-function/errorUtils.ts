
/**
 * Extract technical details from an error message
 * @param error The error message or object
 * @returns A string with technical details about the error
 */
export function getTechnicalErrorDetails(error: string | Error): string {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  // Check for common patterns in error messages
  if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
    return 'Network error: Unable to reach the server. This could be due to connectivity issues or the server being unavailable.';
  }
  
  if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
    return 'Authentication error: Your session may have expired. Try signing out and signing back in.';
  }
  
  if (errorMessage.includes('403') || errorMessage.includes('Forbidden')) {
    return 'Permission error: You do not have permission to access this resource.';
  }
  
  if (errorMessage.includes('CORS') || errorMessage.includes('Cross-Origin')) {
    return 'CORS error: There is a cross-origin resource sharing issue between the browser and server.';
  }
  
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return 'Timeout error: The server took too long to respond. This could be due to server load or network issues.';
  }
  
  if (errorMessage.includes('parse') || errorMessage.includes('JSON')) {
    return 'Parsing error: Failed to process the server response. The data may be in an unexpected format.';
  }
  
  return errorMessage;
}
