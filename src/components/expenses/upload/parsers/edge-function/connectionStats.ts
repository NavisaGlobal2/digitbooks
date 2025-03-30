
// Track connection success and failure stats
let connectionStats = {
  successCount: 0,
  failCount: 0,
  lastSuccess: null as number | null,
  lastFailure: null as number | null,
  endpoint: null as string | null,
  failureReasons: {} as { [key: string]: number },
  corsErrorDetected: false
};

// Technical details object for debugging
const technicalDetails = {
  errors: [] as any[],
  lastError: null as any,
  browserInfo: typeof navigator !== 'undefined' ? {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor
  } : null
};

/**
 * Track successful connection
 */
export const trackSuccessfulConnection = (endpoint: string) => {
  connectionStats.successCount++;
  connectionStats.lastSuccess = Date.now();
  connectionStats.endpoint = endpoint;
};

/**
 * Track failed connection
 */
export const trackFailedConnection = (reason: string, error: any) => {
  // Update counts
  connectionStats.failCount++;
  connectionStats.lastFailure = Date.now();
  
  // Track failure reasons
  if (!connectionStats.failureReasons[reason]) {
    connectionStats.failureReasons[reason] = 0;
  }
  connectionStats.failureReasons[reason]++;
  
  // Check for CORS error
  if (error?.message && (
    error.message.toLowerCase().includes('cors') ||
    error.message.toLowerCase().includes('origin')
  )) {
    connectionStats.corsErrorDetected = true;
  }
  
  // Store technical details
  technicalDetails.lastError = {
    message: error?.message || 'Unknown error',
    stack: error?.stack,
    name: error?.name,
    reason
  };
  
  // Keep last 5 errors for debugging
  technicalDetails.errors.unshift(technicalDetails.lastError);
  if (technicalDetails.errors.length > 5) {
    technicalDetails.errors.pop();
  }
};

/**
 * Get current connection statistics
 */
export const getConnectionStats = () => {
  const total = connectionStats.successCount + connectionStats.failCount;
  const successRate = total > 0 ? Math.round((connectionStats.successCount / total) * 100) : 0;
  const failureRate = total > 0 ? Math.round((connectionStats.failCount / total) * 100) : 0;
  
  return {
    ...connectionStats,
    successRate,
    failureRate,
    errors: technicalDetails.errors.map(e => e.message) // Add errors array from technicalDetails
  };
};

/**
 * Get technical error details for debugging
 */
export const getTechnicalErrorDetails = () => {
  return {
    ...technicalDetails,
    stats: connectionStats
  };
};

/**
 * Reset connection statistics
 */
export const resetConnectionStats = () => {
  connectionStats = {
    successCount: 0,
    failCount: 0,
    lastSuccess: null,
    lastFailure: null,
    endpoint: connectionStats.endpoint, // Keep the endpoint
    failureReasons: {},
    corsErrorDetected: false
  };
  
  // Keep browser info but reset errors
  technicalDetails.errors = [];
  technicalDetails.lastError = null;
};
