
// Track connection statistics to help diagnose issues
interface ConnectionStats {
  successCount: number;
  failCount: number;
  failureCount: number; // Alias for failCount
  lastSuccess: Date | null;
  lastError: Error | null;
  lastFailure: Date | null;
  errors: string[];
  endpoint?: string;
  corsErrorDetected: boolean;
  failureReasons: Map<string, number>;
  successRate: number;
  failureRate: number;
}

// Initialize stats object
const connectionStats: ConnectionStats = {
  successCount: 0,
  failCount: 0,
  failureCount: 0, // Alias for failCount
  lastSuccess: null,
  lastError: null,
  lastFailure: null,
  errors: [],
  endpoint: undefined,
  corsErrorDetected: false,
  failureReasons: new Map<string, number>(),
  successRate: 0,
  failureRate: 0
};

// Track a successful connection
export const trackSuccessfulConnection = (endpoint?: string) => {
  connectionStats.successCount++;
  connectionStats.lastSuccess = new Date();
  if (endpoint) connectionStats.endpoint = endpoint;
  
  // Update success/failure rates
  const total = connectionStats.successCount + connectionStats.failCount;
  connectionStats.successRate = total > 0 ? (connectionStats.successCount / total) * 100 : 0;
  connectionStats.failureRate = total > 0 ? (connectionStats.failCount / total) * 100 : 0;
};

// Track a failed connection - takes optional endpoint parameter
export const trackFailedConnection = (reason: string, error: Error, endpoint?: string) => {
  connectionStats.failCount++;
  connectionStats.failureCount = connectionStats.failCount; // Keep in sync
  connectionStats.lastError = error;
  connectionStats.lastFailure = new Date();
  connectionStats.errors.push(error.message || 'Unknown error');
  
  // Store endpoint if provided
  if (endpoint) connectionStats.endpoint = endpoint;
  
  // Detect CORS errors
  if (
    error.message?.includes('CORS') ||
    error.message?.includes('cross-origin') ||
    error.message?.includes('Cross-Origin')
  ) {
    connectionStats.corsErrorDetected = true;
  }
  
  // Track failure reasons
  const currentCount = connectionStats.failureReasons.get(reason) || 0;
  connectionStats.failureReasons.set(reason, currentCount + 1);
  
  // Update success/failure rates
  const total = connectionStats.successCount + connectionStats.failCount;
  connectionStats.successRate = total > 0 ? (connectionStats.successCount / total) * 100 : 0;
  connectionStats.failureRate = total > 0 ? (connectionStats.failCount / total) * 100 : 0;
};

// Get current stats
export const getConnectionStats = () => {
  return { ...connectionStats };
};

// Reset stats
export const resetConnectionStats = () => {
  connectionStats.successCount = 0;
  connectionStats.failCount = 0;
  connectionStats.failureCount = 0;
  connectionStats.lastSuccess = null;
  connectionStats.lastError = null;
  connectionStats.lastFailure = null;
  connectionStats.errors = [];
  connectionStats.corsErrorDetected = false;
  connectionStats.failureReasons = new Map<string, number>();
  connectionStats.successRate = 0;
  connectionStats.failureRate = 0;
};

// Get technical error details for debugging
export const getTechnicalErrorDetails = () => {
  return {
    errors: connectionStats.errors,
    corsErrorDetected: connectionStats.corsErrorDetected,
    failureReasons: Object.fromEntries(connectionStats.failureReasons),
    lastError: connectionStats.lastError ? {
      message: connectionStats.lastError.message,
      name: connectionStats.lastError.name,
      stack: connectionStats.lastError.stack
    } : null
  };
};
