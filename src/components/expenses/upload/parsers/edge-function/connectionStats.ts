
// Track connection success/failure for edge functions
let successCount = 0;
let failureCount = 0;
let failureReasons: Record<string, number> = {};
let lastFailure: number | null = null;

/**
 * Track a successful connection to the edge function
 */
export const trackSuccessfulConnection = () => {
  successCount++;
};

/**
 * Track a failed connection to the edge function
 */
export const trackFailedConnection = (reason: string = 'unknown') => {
  failureCount++;
  failureReasons[reason] = (failureReasons[reason] || 0) + 1;
  lastFailure = Date.now();
};

/**
 * Get the connection stats for the edge function
 */
export const getConnectionStats = () => {
  const total = successCount + failureCount;
  const successRate = total > 0 ? (successCount / total) * 100 : 0;
  const failureRate = total > 0 ? (failureCount / total) * 100 : 0;
  
  return {
    successCount,
    failureCount,
    successRate: Math.round(successRate),
    failureRate: Math.round(failureRate),
    failureReasons,
    total,
    attempts: total,
    failures: failureCount,
    lastFailure
  };
};

/**
 * Show a fallback message to the user when appropriate
 */
export const showFallbackMessage = (toast: any, message?: string) => {
  const defaultMessage = "Using local CSV parser as fallback due to server connectivity issues";
  toast.info(message || defaultMessage);
};
