
// Track connection statistics for edge functions

export interface ConnectionStats {
  successCount: number;
  failCount: number;
  lastSuccess: Date | null;
  lastFail: Date | null;
  errors: string[];
  total: number;
  successRate: number;
  failureRate: number;
  endpoint?: string;
  corsErrorDetected: boolean;
  failureReasons: Record<string, number>;
}

// Initialize stats
const connectionStats: ConnectionStats = {
  successCount: 0,
  failCount: 0,
  lastSuccess: null,
  lastFail: null,
  errors: [],
  total: 0,
  successRate: 0,
  failureRate: 0,
  endpoint: undefined,
  corsErrorDetected: false,
  failureReasons: {}
};

// Track successful connection
export const trackSuccessfulConnection = (endpoint?: string) => {
  connectionStats.successCount++;
  connectionStats.lastSuccess = new Date();
  if (endpoint) connectionStats.endpoint = endpoint;
  updateRates();
};

// Track failed connection
export const trackFailedConnection = (error: string, type: string = 'unknown') => {
  connectionStats.failCount++;
  connectionStats.lastFail = new Date();
  connectionStats.errors.push(error);
  
  // Track failure by type
  if (!connectionStats.failureReasons[type]) {
    connectionStats.failureReasons[type] = 0;
  }
  connectionStats.failureReasons[type]++;
  
  // Check for CORS errors
  if (error.includes('CORS') || error.includes('cors')) {
    connectionStats.corsErrorDetected = true;
  }
  
  updateRates();
};

// Update success/failure rates
const updateRates = () => {
  connectionStats.total = connectionStats.successCount + connectionStats.failCount;
  if (connectionStats.total > 0) {
    connectionStats.successRate = Math.round((connectionStats.successCount / connectionStats.total) * 100);
    connectionStats.failureRate = 100 - connectionStats.successRate;
  }
};

// Get connection stats
export const getConnectionStats = (): ConnectionStats => {
  return {...connectionStats};
};

// Reset connection stats
export const resetConnectionStats = () => {
  connectionStats.successCount = 0;
  connectionStats.failCount = 0;
  connectionStats.lastSuccess = null;
  connectionStats.lastFail = null;
  connectionStats.errors = [];
  connectionStats.total = 0;
  connectionStats.successRate = 0;
  connectionStats.failureRate = 0;
  connectionStats.corsErrorDetected = false;
  connectionStats.failureReasons = {};
};
