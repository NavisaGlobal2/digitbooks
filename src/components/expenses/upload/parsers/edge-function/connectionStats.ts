
export interface ConnectionStats {
  successCount: number;
  failCount: number;
  total: number;
  successRate: number;
  lastFailReason: string | null;
  lastFailTime: number | null;
}

// Initialize stats object
let connectionStats: ConnectionStats = {
  successCount: 0,
  failCount: 0,
  total: 0,
  successRate: 0,
  lastFailReason: null,
  lastFailTime: null,
};

// Track successful connection
export const trackSuccessfulConnection = (service: string): void => {
  connectionStats.successCount++;
  connectionStats.total++;
  calculateSuccessRate();
};

// Track failed connection
export const trackFailedConnection = (reason: string, service: string): void => {
  connectionStats.failCount++;
  connectionStats.total++;
  connectionStats.lastFailReason = reason;
  connectionStats.lastFailTime = Date.now();
  calculateSuccessRate();
};

// Calculate the success rate percentage
const calculateSuccessRate = (): void => {
  connectionStats.successRate = connectionStats.total > 0 
    ? Math.round((connectionStats.successCount / connectionStats.total) * 100) 
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
    lastFailReason: null,
    lastFailTime: null,
  };
};
