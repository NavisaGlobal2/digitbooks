
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

// Add sendRequestWithRetry function needed by parser.ts
export const sendRequestWithRetry = async (
  endpoint: string,
  token: string,
  formData: FormData,
  onSuccess: (transactions: any[]) => boolean,
  onError: (errorMessage: string) => boolean,
  isPdf: boolean = false,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<boolean> => {
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    return onSuccess(result.transactions || []);
  } catch (error: any) {
    if (retryCount < maxRetries) {
      console.log(`Request failed, retrying (${retryCount + 1}/${maxRetries})...`);
      // We'd normally use sleep here but we can implement directly
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return sendRequestWithRetry(
        endpoint, 
        token, 
        formData, 
        onSuccess, 
        onError, 
        isPdf,
        retryCount + 1,
        maxRetries
      );
    }
    
    return onError(error.message || 'Network request failed');
  }
};
