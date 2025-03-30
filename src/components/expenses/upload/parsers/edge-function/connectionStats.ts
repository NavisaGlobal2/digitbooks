
// Track connection statistics for edge functions
let successCount = 0;
let failCount = 0;
let lastSuccess: Date | null = null;
let lastFail: Date | null = null;
let errors: string[] = [];
let technicalDetails: any = {};
let corsErrorDetected = false;
let endpoint: string = '';
let failureReasons: Record<string, number> = {};

export const trackSuccessfulConnection = (type: string) => {
  successCount++;
  lastSuccess = new Date();
};

export const trackFailedConnection = (type: string, error: any) => {
  failCount++;
  lastFail = new Date();
  
  const errorMessage = error?.message || String(error) || 'Unknown error';
  errors = [errorMessage, ...errors].slice(0, 5);
  
  // Track failure reasons
  failureReasons[type] = (failureReasons[type] || 0) + 1;
  
  // Check for CORS errors
  if (errorMessage.includes('CORS') || 
      errorMessage.includes('cross-origin') || 
      errorMessage.includes('origin')) {
    corsErrorDetected = true;
  }
  
  // Store technical details for debugging
  technicalDetails = {
    ...technicalDetails,
    lastError: error,
    lastErrorType: type,
    lastErrorTime: new Date(),
    authStatus: error?.status === 401 ? 'AUTH_FAILED' : 'OTHER_ERROR'
  };
  
  // Log for debugging
  console.error(`Connection failed (${type}):`, error);
};

export const setEndpoint = (url: string) => {
  endpoint = url;
};

export const getConnectionStats = () => {
  // Calculate success and failure rates
  const total = successCount + failCount;
  const successRate = total > 0 ? Math.round((successCount / total) * 100) : 0;
  const failureRate = total > 0 ? Math.round((failCount / total) * 100) : 0;
  
  return {
    successCount,
    failCount,
    lastSuccess,
    lastFail,
    errors,
    corsErrorDetected,
    endpoint,
    successRate,
    failureRate,
    failureReasons
  };
};

export const getTechnicalErrorDetails = () => {
  return technicalDetails;
};

// Reset stats (for testing)
export const resetStats = () => {
  successCount = 0;
  failCount = 0;
  lastSuccess = null;
  lastFail = null;
  errors = [];
  technicalDetails = {};
  corsErrorDetected = false;
  endpoint = '';
  failureReasons = {};
};

// Function to ensure backward compatibility with code that might use resetConnectionStats
export const resetConnectionStats = resetStats;
