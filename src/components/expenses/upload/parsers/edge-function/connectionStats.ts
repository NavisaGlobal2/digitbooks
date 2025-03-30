// Track connection statistics for debugging and monitoring
export const connectionStats = {
  successCount: 0,
  failCount: 0,
  failureCount: 0, // Alias for failCount for compatibility
  lastSuccess: null as Date | null,
  lastError: null as Error | null,
  lastFailure: null as Date | null,
  errors: [] as string[],
  endpoint: null as string | null,
  corsErrorDetected: false,
  failureReasons: {} as Record<string, number>,
  successRate: 0,
  failureRate: 0
};

// Get connection statistics
export const getConnectionStats = () => connectionStats;

// Track successful connection
export const trackSuccessfulConnection = (endpoint?: string) => {
  connectionStats.successCount++;
  connectionStats.lastSuccess = new Date();
  
  if (endpoint) {
    connectionStats.endpoint = endpoint;
  }
  
  // Calculate rates
  const total = connectionStats.successCount + connectionStats.failCount;
  connectionStats.successRate = total > 0 ? Math.round((connectionStats.successCount / total) * 100) : 0;
  connectionStats.failureRate = total > 0 ? Math.round((connectionStats.failCount / total) * 100) : 0;
};

// Track failed connection
export const trackFailedConnection = (reason: string, error: any, url?: string) => {
  connectionStats.failCount++;
  connectionStats.failureCount = connectionStats.failCount; // Keep in sync
  connectionStats.lastError = error instanceof Error ? error : new Error(String(error));
  connectionStats.lastFailure = new Date();
  connectionStats.errors.push(`${new Date().toISOString()}: ${reason} - ${error?.message || 'Unknown error'} ${url ? `(${url})` : ''}`);
  
  // Update endpoint if provided
  if (url) {
    connectionStats.endpoint = url;
  }
  
  // Check for CORS error
  if (
    error?.message?.includes('CORS') || 
    error?.message?.includes('cors') || 
    reason.includes('CORS') || 
    reason.includes('cors')
  ) {
    connectionStats.corsErrorDetected = true;
  }
  
  // Track failure reasons
  if (reason) {
    if (!connectionStats.failureReasons[reason]) {
      connectionStats.failureReasons[reason] = 1;
    } else {
      connectionStats.failureReasons[reason]++;
    }
  }
  
  // Keep only the last 10 errors
  if (connectionStats.errors.length > 10) {
    connectionStats.errors.shift();
  }
  
  // Calculate rates
  const total = connectionStats.successCount + connectionStats.failCount;
  connectionStats.successRate = total > 0 ? Math.round((connectionStats.successCount / total) * 100) : 0;
  connectionStats.failureRate = total > 0 ? Math.round((connectionStats.failCount / total) * 100) : 0;
};

// Get technical error details for debugging
export const getTechnicalErrorDetails = () => {
  return {
    errorCount: connectionStats.errors.length,
    lastError: connectionStats.lastError?.message || null,
    lastErrorStack: connectionStats.lastError?.stack || null,
    failureReasons: connectionStats.failureReasons,
    corsDetected: connectionStats.corsErrorDetected,
    endpoint: connectionStats.endpoint
  };
};

// Reset connection statistics
export const resetConnectionStats = () => {
  connectionStats.successCount = 0;
  connectionStats.failCount = 0;
  connectionStats.failureCount = 0;
  connectionStats.lastSuccess = null;
  connectionStats.lastError = null;
  connectionStats.lastFailure = null;
  connectionStats.errors = [];
  connectionStats.corsErrorDetected = false;
  connectionStats.failureReasons = {};
  connectionStats.successRate = 0;
  connectionStats.failureRate = 0;
  // We keep the endpoint for reference
};
