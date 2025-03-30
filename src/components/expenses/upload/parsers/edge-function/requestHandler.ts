
// If the file doesn't exist yet, let's create it
import { trackFailedConnection } from "./connectionStats";
import { handleResponseSuccess, handleResponseError, handleNetworkError } from "./apiClient";

export const handleEdgeFunctionRequest = async (url: string, options: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`Edge function request failed: ${response.status} ${response.statusText}`);
      return await handleResponseError(response);
    }
    
    return await handleResponseSuccess(response);
  } catch (error: any) {
    console.error("Network error making edge function request:", error);
    trackFailedConnection('edge_function_request', error);
    return handleNetworkError(error);
  }
};
