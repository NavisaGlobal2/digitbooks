
// Max number of retry attempts
export const MAX_RETRIES = 3;

// Sleep function for delay between retries
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Calculate delay with exponential backoff
export const getRetryDelay = (attempt: number, baseDelay = 1000): number => {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000); // Max 10 seconds
};
