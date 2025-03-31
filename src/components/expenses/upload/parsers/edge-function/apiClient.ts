
import { ParsedTransaction } from "../types";
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";

/**
 * Handle response error from the edge function
 */
export const handleResponseError = async (response: Response): Promise<any> => {
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
  
  // Add special handling for PDF-specific errors
  if (errorMessage.includes("operation is not supported") || 
      errorMessage.includes("The operation is not supported")) {
    return {
      message: "PDF processing requires multiple attempts. Please try uploading again.", 
      status: response.status,
      isPdfError: true
    };
  }
  
  return { 
    message: errorMessage, 
    status: response.status 
  };
};

/**
 * Call the edge function API with retries and error handling
 */
export const callEdgeFunction = async (
  url: string,
  token: string,
  formData: FormData,
  onSuccess: (result: any) => boolean,
  onError: (error: any) => boolean
): Promise<boolean> => {
  try {
    console.log(`Calling edge function: ${url}`);
    
    // Track that we're attempting to connect
    trackSuccessfulConnection(url);
    
    // Custom fetch to edge function with explicit timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    console.log("Request headers:", {
      Authorization: `Bearer ${token.substring(0, 10)}...` // Only log part of the token for security
    });
    
    const response = await fetch(
      url,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal
      }
    );
    
    clearTimeout(timeoutId);
    
    console.log(`Edge function response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await handleResponseError(response);
      trackFailedConnection('api_response_error', url);
      throw errorData;
    }
    
    const result = await response.json();
    console.log("Edge function response data:", result);
    return onSuccess(result);
  } catch (error: any) {
    console.error("Error calling edge function:", error);
    trackFailedConnection(error?.errorType || 'api_call_error', url);
    return onError(error);
  }
};
