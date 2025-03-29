
// Track connection success/failure for edge functions
let successCount = 0;
let failureCount = 0;
let failureReasons: Record<string, number> = {};
let lastFailure: number | null = null;
let lastError: any = null;
let endpoint: string | null = null;
let corsErrorDetected = false;
let corsDetails: any = null;

/**
 * Track a successful connection to the edge function
 */
export const trackSuccessfulConnection = (url?: string) => {
  successCount++;
  corsErrorDetected = false;
  if (url) {
    endpoint = url;
  }
};

/**
 * Track a failed connection to the edge function
 */
export const trackFailedConnection = (reason: string = 'unknown', error?: any, url?: string) => {
  failureCount++;
  failureReasons[reason] = (failureReasons[reason] || 0) + 1;
  lastFailure = Date.now();
  
  if (error) {
    lastError = error;
    
    // Check for CORS related errors
    if (
      error.message && (
        error.message.includes('CORS') || 
        error.message.includes('origin') ||
        error.message.includes('cross-origin')
      )
    ) {
      corsErrorDetected = true;
      corsDetails = {
        url: url || endpoint,
        message: error.message,
        time: new Date().toISOString()
      };
    }
  }
  
  if (url) {
    endpoint = url;
  }
};

/**
 * Reset connection stats
 */
export const resetConnectionStats = () => {
  successCount = 0;
  failureCount = 0;
  failureReasons = {};
  lastFailure = null;
  lastError = null;
  corsErrorDetected = false;
  corsDetails = null;
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
    lastFailure,
    lastError,
    endpoint,
    corsErrorDetected,
    corsDetails
  };
};

/**
 * Show a fallback message to the user when appropriate
 */
export const showFallbackMessage = (toast: any, message?: string) => {
  const defaultMessage = "Using local CSV parser as fallback due to server connectivity issues";
  toast.info(message || defaultMessage);
};

/**
 * Get detailed error information for debugging
 */
export const getTechnicalErrorDetails = () => {
  if (!lastError) {
    return "No error details available";
  }
  
  return {
    message: lastError.message || "Unknown error",
    stack: lastError.stack,
    endpoint,
    corsErrorDetected,
    corsDetails,
    failureReasons: Object.keys(failureReasons).map(key => `${key}: ${failureReasons[key]}`).join(', '),
    timestamp: lastFailure ? new Date(lastFailure).toISOString() : null
  };
};
