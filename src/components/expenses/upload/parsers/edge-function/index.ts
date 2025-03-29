
// Export all functionalities from the module
export { getConnectionStats, trackSuccessfulConnection, trackFailedConnection, showFallbackMessage } from './connectionStats';
export { handleCSVFallback } from './fallbackHandler';
export { MAX_RETRIES, sleep } from './retryHandler';
export { handleEdgeFunctionError } from './errorHandler';
export { getAuthToken } from './authHandler';
export { parseViaEdgeFunction } from './parser';
export { callEdgeFunction, handleResponseError } from './apiClient';
export { processSuccessfulResult } from './responseProcessor';
export { handleNetworkError, handleOtherErrors } from './errorHandlers';
export { prepareFormData, createRequestConfig } from './formDataPreparation';
export { handlePDFError, trackPDFAttempt, resetPDFAttemptCounter, handlePDFRetry, addPDFOptions } from './pdfHandler';
export { sendRequestWithRetry, makeEdgeFunctionRequest } from './requestHandler';
