
/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Maximum number of retry attempts
 */
export const MAX_RETRIES = 2;

/**
 * Handle retry logic for edge function calls
 */
export const handleRetry = async <T>(
  operation: () => Promise<T>,
  retryCount: number,
  maxRetries: number = MAX_RETRIES
): Promise<{ result: T | null; error: any; exhausted: boolean }> => {
  try {
    // Add a small delay before retrying to prevent overwhelming the server
    if (retryCount > 0) {
      console.log(`Retry attempt ${retryCount} of ${maxRetries}...`);
      await sleep(1000 * retryCount);
    }
    
    console.log(`Starting fetch request to edge function (attempt ${retryCount + 1})...`);
    
    const result = await operation();
    
    return { result, error: null, exhausted: false };
  } catch (error) {
    const exhausted = retryCount >= maxRetries;
    return { result: null, error, exhausted };
  }
};
