
import { addPDFOptions, trackPDFAttempt, resetPDFAttemptCounter } from "./pdfHandler";

/**
 * Prepare form data for the edge function request
 */
export const prepareFormData = (
  file: File,
  options: any = {}
): { formData: FormData; isPdf: boolean; pdfAttemptCount: number } => {
  // Create FormData with file and options
  const formData = new FormData();
  formData.append("file", file);
  
  // Check if this is a PDF file
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  let pdfAttemptCount = 0;
  
  if (isPdf) {
    pdfAttemptCount = trackPDFAttempt();
    addPDFOptions(formData, options, pdfAttemptCount);
    
    // Add debug mode to get more verbose logs
    formData.append("debugMode", "true");
    
    // Add clear indication that we want to use Vision API
    const useVision = options?.useVision !== false; // Default to true unless explicitly set to false
    formData.append("useVision", useVision ? "true" : "false");
    
    // Log the options being used for debugging
    console.log("PDF processing options being sent:", {
      isPdf,
      useVision: useVision ? "true" : "false",
      pdfAttemptCount,
      safeProcessing: options?.safeProcessing === true ? "true" : "false",
      debugMode: true
    });
  } else {
    // Reset PDF attempt counter for non-PDF files
    resetPDFAttemptCounter();
  }
  
  // Add preferred provider if specified
  if (options?.preferredProvider) {
    formData.append("preferredProvider", options.preferredProvider);
    console.log(`Using preferred AI provider: ${options.preferredProvider}`);
  }
  
  // Add additional flags to enforce real data extraction
  if (options?.forceRealData) {
    formData.append("forceRealData", "true");
  }
  
  if (options?.disableFakeDataGeneration) {
    formData.append("disableFakeDataGeneration", "true");
  }
  
  if (options?.strictExtractMode) {
    formData.append("strictExtractMode", "true");
  }
  
  if (options?.debugMode) {
    formData.append("debugMode", "true");
  }
  
  return { formData, isPdf, pdfAttemptCount };
};

/**
 * Create request configuration for the edge function
 */
export const createRequestConfig = (token: string): RequestInit => {
  // Add a stronger timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("Request timeout reached, aborting...");
    controller.abort();
  }, 60000); // 60-second timeout for PDFs
  
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal
  };
};
