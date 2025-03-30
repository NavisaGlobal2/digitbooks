
// Maximum number of retry attempts
export const MAX_RETRIES = 2;

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate exponential backoff delay
 */
export const calculateBackoff = (attempt: number, baseMs: number = 500): number => {
  return baseMs * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms, etc.
};
