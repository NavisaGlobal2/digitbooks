
// Export all functionalities from the module
export { getConnectionStats, trackSuccessfulConnection, trackFailedConnection, showFallbackMessage } from './connectionStats';
export { handleCSVFallback } from './fallbackHandler';
export { MAX_RETRIES, sleep, handleRetry } from './retryHandler';
export { handleEdgeFunctionError } from './errorHandler';
export { getAuthToken } from './authHandler';
export { parseViaEdgeFunction } from './parser';
export { callEdgeFunction, handleResponseError } from './apiClient';
export { processSuccessfulResult } from './responseProcessor';
