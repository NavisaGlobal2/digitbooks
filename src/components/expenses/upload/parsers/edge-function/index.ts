
export { parseViaEdgeFunction } from './parser';
export { 
  getConnectionStats, 
  resetConnectionStats,
  trackSuccessfulConnection,
  trackFailedConnection 
} from './connectionStats';
export { getTechnicalErrorDetails } from './errorUtils';
export { getAuthToken } from './authHandler';
export { sleep, MAX_RETRIES } from './retryHandler';

// Helper function for showing fallback messages
export const showFallbackMessage = (message?: string) => {
  console.log(message || "Using fallback processing method");
};

// Export the connection stats type
export type { ConnectionStats } from './connectionStats';
