
export interface ConnectionStats {
  successCount: number;
  failCount: number;
  total: number;
  successRate: number;
  failureRate: number;
  lastFailReason: string | null;
  lastFailTime: number | null;
  lastSuccess: number | null;
  lastFail: number | null;
  endpoint: string | null;
  corsErrorDetected: boolean;
  failureReasons: Record<string, number>;
  errors: string[];
}

// Initialize stats object
let connectionStats: ConnectionStats = {
  successCount: 0,
  failCount: 0,
  total: 0,
  successRate: 0,
  failureRate: 0,
  lastFailReason: null,
  lastFailTime: null,
  lastSuccess: null,
  lastFail: null,
  endpoint: null,
  corsErrorDetected: false,
  failureReasons: {},
  errors: []
};

// Track successful connection
export const trackSuccessfulConnection = (service: string): void => {
  connectionStats.successCount++;
  connectionStats.total++;
  connectionStats.lastSuccess = Date.now();
  connectionStats.endpoint = service;
  calculateSuccessRate();
};

// Track failed connection
export const trackFailedConnection = (reason: string, service: string): void => {
  connectionStats.failCount++;
  connectionStats.total++;
  connectionStats.lastFailReason = reason;
  connectionStats.lastFailTime = Date.now();
  connectionStats.lastFail = Date.now();
  connectionStats.endpoint = service;
  
  // Increment the count for this specific reason
  if (!connectionStats.failureReasons[reason]) {
    connectionStats.failureReasons[reason] = 1;
  } else {
    connectionStats.failureReasons[reason]++;
  }
  
  // Add to errors array (limit to latest 10)
  const errorMessage = `${new Date().toISOString()} - ${reason}: ${service}`;
  connectionStats.errors.unshift(errorMessage);
  if (connectionStats.errors.length > 10) {
    connectionStats.errors.pop();
  }
  
  // Check if it's a CORS error
  if (reason === 'cors_error') {
    connectionStats.corsErrorDetected = true;
  }
  
  calculateSuccessRate();
};

// Calculate the success rate percentage
const calculateSuccessRate = (): void => {
  connectionStats.successRate = connectionStats.total > 0 
    ? Math.round((connectionStats.successCount / connectionStats.total) * 100) 
    : 0;
  connectionStats.failureRate = connectionStats.total > 0
    ? Math.round((connectionStats.failCount / connectionStats.total) * 100)
    : 0;
};

// Get the current connection stats
export const getConnectionStats = (): ConnectionStats => {
  return { ...connectionStats };
};

// Reset connection stats (mainly for testing)
export const resetConnectionStats = (): void => {
  connectionStats = {
    successCount: 0,
    failCount: 0,
    total: 0,
    successRate: 0,
    failureRate: 0,
    lastFailReason: null,
    lastFailTime: null,
    lastSuccess: null,
    lastFail: null,
    endpoint: null,
    corsErrorDetected: false,
    failureReasons: {},
    errors: []
  };
};
