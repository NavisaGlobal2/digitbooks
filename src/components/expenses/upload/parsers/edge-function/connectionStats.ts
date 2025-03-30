// Track connection statistics for debugging and monitoring
export const connectionStats = {
  successCount: 0,
  failCount: 0,
  lastSuccess: null as Date | null,
  lastError: null as Error | null,
  errors: [] as string[]
};

// Get connection statistics
export const getConnectionStats = () => connectionStats;

// Track successful connection
export const trackSuccessfulConnection = () => {
  connectionStats.successCount++;
  connectionStats.lastSuccess = new Date();
};

// Track failed connection
export const trackFailedConnection = (reason: string, error: any, url?: string) => {
  connectionStats.failCount++;
  connectionStats.lastError = error instanceof Error ? error : new Error(String(error));
  connectionStats.errors.push(`${new Date().toISOString()}: ${reason} - ${error?.message || 'Unknown error'} ${url ? `(${url})` : ''}`);
  
  // Keep only the last 10 errors
  if (connectionStats.errors.length > 10) {
    connectionStats.errors.shift();
  }
};
