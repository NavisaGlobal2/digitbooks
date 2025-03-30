
import { trackSuccessfulConnection, trackFailedConnection } from './connectionStats';

/**
 * Handle successful response from API
 */
export const handleResponseSuccess = async (response: Response) => {
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error parsing JSON response:', error);
    throw new Error('Invalid response format');
  }
};

/**
 * Handle error response from API
 */
export const handleResponseError = async (response: Response) => {
  let errorMessage = `Error ${response.status}: ${response.statusText}`;
  
  try {
    // Try to get detailed error from JSON response
    const errorData = await response.json();
    if (errorData.error) {
      errorMessage = errorData.error;
    }
  } catch {
    // If JSON parsing fails, use the status text
    console.warn('Could not parse error response JSON');
  }
  
  throw new Error(errorMessage);
};

/**
 * Handle network error
 */
export const handleNetworkError = (error: Error) => {
  trackFailedConnection('network_error', error);
  throw error;
};
