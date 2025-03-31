
// Maximum number of retry attempts for API calls
export const MAX_RETRIES = 3;

/**
 * Utility function to pause execution for a specified time
 * @param ms - Time to sleep in milliseconds
 * @returns Promise that resolves after the specified time
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Execute a function with retries
 * @param fn - Function to execute
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Base delay between retries in milliseconds
 * @returns Promise resolving to the function result
 */
export const withRetry = async <T>(
  fn: () => Promise<T>, 
  maxRetries: number = MAX_RETRIES,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed:`, error);
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        // Exponential backoff with jitter
        const delay = retryDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5);
        await sleep(delay);
      }
    }
  }
  
  throw lastError;
};
