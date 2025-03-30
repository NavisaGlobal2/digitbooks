
// Track connection statistics for edge functions
let successCount = 0;
let failCount = 0;
let lastSuccess: Date | null = null;
let lastFail: Date | null = null;
let errors: string[] = [];
let technicalDetails: any = {};

export const trackSuccessfulConnection = (type: string) => {
  successCount++;
  lastSuccess = new Date();
};

export const trackFailedConnection = (type: string, error: any) => {
  failCount++;
  lastFail = new Date();
  
  const errorMessage = error?.message || String(error) || 'Unknown error';
  errors = [errorMessage, ...errors].slice(0, 5);
  
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

export const getConnectionStats = () => {
  return {
    successCount,
    failCount,
    lastSuccess,
    lastFail,
    errors
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
};
