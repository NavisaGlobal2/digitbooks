
import { sleep } from "./retryHandler";
import { trackFailedConnection } from "./connectionStats";

/**
 * Handle PDF-specific errors and retry logic
 */
export const handlePDFError = (
  error: any,
  retryCount: number,
  isPdfError: boolean
): { shouldRetry: boolean; message: string } => {
  // Check for PDF-specific errors
  const isPdfProcessingError = isPdfError || 
    (error.message && (
      error.message.includes("operation is not supported") ||
      error.message.includes("Maximum call stack size exceeded") ||
      error.message.includes("sandbox environment internal error") ||
      error.message.includes("PDF processing error")
    ));
  
  if (isPdfProcessingError) {
    console.log('PDF processing error detected.');
    
    // If this is our last retry, give a clear message to the user
    if (retryCount > 0) {
      return { 
        shouldRetry: false, 
        message: "We're experiencing technical limitations with PDF processing. Please try using a CSV or Excel format if available."
      };
    }
    
    return { 
      shouldRetry: true,
      message: "PDF processing requires another attempt. Retrying..."
    };
  }
  
  return { shouldRetry: false, message: error.message };
};

/**
 * Track PDF attempts in local storage
 */
export const trackPDFAttempt = (): number => {
  const pdfAttemptCount = localStorage.getItem('pdf_attempt_count') ? 
                         parseInt(localStorage.getItem('pdf_attempt_count') || '0') : 0;
  const newCount = pdfAttemptCount + 1;
  localStorage.setItem('pdf_attempt_count', newCount.toString());
  console.log(`PDF attempt count: ${newCount}`);
  return newCount;
};

/**
 * Reset PDF attempt counter
 */
export const resetPDFAttemptCounter = (): void => {
  localStorage.removeItem('pdf_attempt_count');
};

/**
 * Handle PDF retry logic with different approaches based on attempt count
 */
export const handlePDFRetry = async (
  formData: FormData,
  retryCount: number
): Promise<void> => {
  if (retryCount > 0) {
    // Add a pause before retrying to give the service time to recover
    console.log('Retrying PDF processing with different approach after short delay...');
    await sleep(2000); // Wait 2 seconds before retry
    
    // After multiple attempts, try enhanced PDF mode
    if (retryCount > 2) {
      console.log("Multiple PDF attempts detected, using enhanced PDF handling");
      formData.append("enhancedPdfMode", "true");
    }
  }
};

/**
 * Add PDF-specific options to FormData
 */
export const addPDFOptions = (
  formData: FormData,
  options: any,
  pdfAttemptCount: number
): void => {
  formData.append("fileType", "pdf");
  console.log("PDF file detected. Adding special handling flags.");
  
  // Add special flags to ensure we're getting real data
  formData.append("extractRealData", "true");
  formData.append("useVision", options?.useVision ? "true" : "false");
  formData.append("forceRealData", options?.forceRealData ? "true" : "false");
  
  if (options?.context) {
    formData.append("context", options.context);
  }
  
  // Add safe processing option to prevent stack overflows
  formData.append("safeProcessing", options?.safeProcessing ? "true" : "false");
  
  // After multiple attempts with the same PDF, try a different approach
  if (pdfAttemptCount > 3) {
    console.log("Multiple PDF attempts detected, using enhanced PDF handling");
    formData.append("enhancedPdfMode", "true");
  }
};
