
import { trackFailedConnection } from "./connectionStats";

// Function to handle successful API responses
export const handleResponseSuccess = async (response: Response) => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    throw new Error("Failed to parse JSON from response");
  }
};

// Function to handle API errors
export const handleResponseError = async (response: Response) => {
  let errorData;
  try {
    errorData = await response.json();
  } catch (jsonError) {
    console.error("Failed to parse error JSON:", jsonError);
    errorData = { message: `Failed to parse error JSON: ${response.statusText}` };
  }

  const errorMessage = errorData?.message || response.statusText || "Unknown error";
  console.error(`API Error: ${response.status} - ${errorMessage}`);

  // Enhanced error details
  const errorDetails = {
    status: response.status,
    message: errorMessage,
    details: errorData?.details || null,
    timestamp: new Date().toISOString()
  };

  console.error("Error details:", errorDetails);
  trackFailedConnection('response_error', new Error('Response error occurred'));
  
  const error = new Error(errorMessage);
  (error as any).status = response.status;
  (error as any).details = errorDetails;
  return error;
};

// Function to handle network errors (e.g., server not found)
export const handleNetworkError = (error: Error) => {
  console.error("Network error:", error);
  trackFailedConnection('network_error', error);
  return new Error("Network error occurred. Please check your connection and try again.");
};

// Function to handle unexpected errors
export const handleUnexpectedError = (error: any) => {
  console.error("Unexpected error:", error);
  trackFailedConnection('unexpected_error', error);
  return new Error("An unexpected error occurred. Please try again later.");
};
