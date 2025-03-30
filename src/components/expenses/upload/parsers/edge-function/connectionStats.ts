
export interface ConnectionStats {
  successCount: number;
  failCount: number;
  lastSuccess: Date | null;
  lastFail: Date | null;
  errors: string[];
  endpoint?: string;
  corsErrorDetected?: boolean;
  successRate?: number;
  failureRate?: number;
  failureReasons?: Record<string, number>;
  total?: number; // Added for ConnectionStatistics component
}

const stats: ConnectionStats = {
  successCount: 0,
  failCount: 0,
  lastSuccess: null,
  lastFail: null,
  errors: [],
  endpoint: "",
  corsErrorDetected: false,
  successRate: 0,
  failureRate: 0,
  failureReasons: {},
  total: 0 // Added for ConnectionStatistics component
};

export function recordSuccess(endpoint: string) {
  stats.successCount++;
  stats.lastSuccess = new Date();
  stats.endpoint = endpoint;
  
  // Update total
  stats.total = stats.successCount + stats.failCount;
  
  // Calculate rates
  stats.successRate = (stats.successCount / stats.total) * 100;
  stats.failureRate = (stats.failCount / stats.total) * 100;
}

export function recordFailure(endpoint: string, error: string | any, details?: any) {
  stats.failCount++;
  stats.lastFail = new Date();
  
  // Handle error being an object
  const errorMessage = typeof error === 'string' ? error : 
                      (error?.message || JSON.stringify(error));
  
  stats.errors.push(errorMessage);
  stats.endpoint = endpoint;
  
  // Limit errors array to latest 10 entries
  if (stats.errors.length > 10) {
    stats.errors = stats.errors.slice(stats.errors.length - 10);
  }
  
  // Check if this is a CORS error
  if (errorMessage.toLowerCase().includes('cors') || 
      errorMessage.toLowerCase().includes('cross-origin') ||
      errorMessage.toLowerCase().includes('not allowed')) {
    stats.corsErrorDetected = true;
  }
  
  // Track common error patterns
  if (!stats.failureReasons) {
    stats.failureReasons = {};
  }
  
  let errorCategory = categorizeError(errorMessage);
  stats.failureReasons[errorCategory] = (stats.failureReasons[errorCategory] || 0) + 1;
  
  // Update total
  stats.total = stats.successCount + stats.failCount;
  
  // Calculate rates
  stats.successRate = (stats.successCount / stats.total) * 100;
  stats.failureRate = (stats.failCount / stats.total) * 100;
}

// Alias functions for backward compatibility
export const trackSuccessfulConnection = recordSuccess;
export const trackFailedConnection = recordFailure;

export function getConnectionStats(): ConnectionStats {
  return { ...stats };
}

export function resetConnectionStats() {
  stats.successCount = 0;
  stats.failCount = 0;
  stats.lastSuccess = null;
  stats.lastFail = null;
  stats.errors = [];
  stats.corsErrorDetected = false;
  stats.successRate = 0;
  stats.failureRate = 0;
  stats.failureReasons = {};
  stats.total = 0;
}

function categorizeError(error: string): string {
  const errorLower = error.toLowerCase();
  
  if (errorLower.includes('auth') || errorLower.includes('unauthorized') || errorLower.includes('401')) {
    return 'authentication';
  } else if (errorLower.includes('cors') || errorLower.includes('cross-origin')) {
    return 'cors';
  } else if (errorLower.includes('timeout') || errorLower.includes('timed out')) {
    return 'timeout';
  } else if (errorLower.includes('404') || errorLower.includes('not found')) {
    return 'not_found';
  } else if (errorLower.includes('network') || errorLower.includes('connection')) {
    return 'network';
  } else if (errorLower.includes('parse') || errorLower.includes('json')) {
    return 'parsing';
  } else {
    return 'other';
  }
}
