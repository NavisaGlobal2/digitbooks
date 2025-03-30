
// If the file doesn't exist yet, let's create it
import { trackSuccessfulConnection, trackFailedConnection } from "./connectionStats";
import { handleResponseSuccess, handleResponseError, handleNetworkError } from "./apiClient";

export const handleEdgeFunctionRequest = async (url: string, options: RequestInit): Promise<any> => {
  try {
    console.log(`Making edge function request to: ${url}`);
    const response = await fetch(url, options);
    
    if (!response.ok) {
      console.error(`Edge function request failed: ${response.status} ${response.statusText}`);
      
      // Special handling for 401 Unauthorized
      if (response.status === 401) {
        trackFailedConnection('auth_error_401', new Error('Authentication failed. Please sign in again.'));
        console.error('Authentication error: 401 Unauthorized. User needs to sign in again.');
        
        // Check if we can get more details from the response
        try {
          const errorData = await response.json();
          console.error('Auth error details:', errorData);
          return { 
            error: errorData.error || 'Authentication error. Please sign in again.', 
            status: 401,
            errorType: 'authentication'
          };
        } catch (e) {
          return { 
            error: 'Authentication error. Please sign in again.', 
            status: 401,
            errorType: 'authentication'
          };
        }
      }
      
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
    console.log(`Sending request to ${endpoint} with token (length: ${token.length})`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      
      try {
        // Try to parse as JSON to get more detailed error
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error || errorMessage;
        
        // Special handling for authentication errors
        if (response.status === 401 || errorJson.errorType === 'authentication') {
          throw new Error(`Authentication error: ${errorJson.error}. Please sign in again.`);
        }
        
      } catch (jsonError) {
        // If not valid JSON, use the raw text
        console.log('Response is not valid JSON, using raw text');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new Error(result.error);
    }
    
    trackSuccessfulConnection('edge_function');
    return onSuccess(result.transactions || []);
  } catch (error: any) {
    // Special handling for authentication errors
    if (error.message && (
      error.message.includes('Authentication') || 
      error.message.includes('auth') ||
      error.message.includes('sign in')
    )) {
      console.error('Authentication error detected:', error.message);
      trackFailedConnection('auth_error', error);
      return onError(`Authentication error: ${error.message}. Please sign in again.`);
    }
    
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
