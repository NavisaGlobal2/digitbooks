
/**
 * Prepare form data for the edge function request
 */
export const prepareFormData = (
  file: File,
  options: any = {}
): { formData: FormData; isPdf: boolean; pdfAttemptCount: number } => {
  console.log("🔄 STEP 1: Preparing form data for file:", file.name);
  
  // Create FormData with file and options
  const formData = new FormData();
  formData.append("file", file);
  
  // Add diagnostic flag to get detailed Vision API information
  formData.append("diagnosticMode", "true");
  formData.append("returnDiagnostics", "true");
  
  // Check if this is a PDF file
  const isPdf = file.name.toLowerCase().endsWith('.pdf');
  let pdfAttemptCount = 0;
  
  if (isPdf) {
    console.log("🔄 STEP 1.1: PDF file detected. Adding special handling flags.");
    pdfAttemptCount = trackPDFAttempt();
    addPDFOptions(formData, options, pdfAttemptCount);
    
    // Add debug mode to get more verbose logs
    formData.append("debugMode", "true");
    
    // Add clear indication that we want to use Vision API
    const useVision = options?.useVision !== false; // Default to true unless explicitly set to false
    console.log(`🔄 STEP 1.2: Setting useVision flag to: ${useVision}`);
    formData.append("useVision", useVision ? "true" : "false");
    
    if (useVision) {
      console.log("🔄 STEP 1.3: Adding FORCE_VISION_API flag to ensure Vision API is used");
      formData.append("FORCE_VISION_API", "true");
    }
  } else {
    // Reset PDF attempt counter for non-PDF files
    resetPDFAttemptCounter();
  }
  
  // Add preferred provider if specified
  if (options?.preferredProvider) {
    formData.append("preferredProvider", options.preferredProvider);
    console.log(`📋 STEP 1.4: Using preferred AI provider: ${options.preferredProvider}`);
  }
  
  // Add additional flags to enforce real data extraction
  if (options?.forceRealData) {
    formData.append("forceRealData", "true");
  }
  
  // Always add these flags to prevent dummy data generation
  formData.append("disableFakeDataGeneration", "true");
  formData.append("strictExtractMode", "true");
  formData.append("returnEmptyOnFailure", "true");
  formData.append("neverGenerateDummyData", "true");
  
  if (options?.debugMode) {
    formData.append("debugMode", "true");
  }
  
  // Store original file name for reference
  formData.append("originalFileName", file.name);
  
  console.log("✅ STEP 1.5: Form data preparation complete");
  
  return { formData, isPdf, pdfAttemptCount };
};

/**
 * Create request configuration for the edge function
 */
export const createRequestConfig = (token: string): RequestInit => {
  console.log("🔄 STEP 2: Creating request configuration with auth token");
  
  // Add a stronger timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.log("⏱️ Request timeout reached, aborting...");
    controller.abort();
  }, 60000); // 60-second timeout for PDFs
  
  console.log("✅ STEP 2.1: Request configured with auth token and 60s timeout");
  
  return {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    signal: controller.signal
  };
};

// PDF attempt tracking functions
// Track PDF attempts in local storage
export const trackPDFAttempt = (): number => {
  const pdfAttemptCount = localStorage.getItem('pdf_attempt_count') ? 
                         parseInt(localStorage.getItem('pdf_attempt_count') || '0') : 0;
  const newCount = pdfAttemptCount + 1;
  localStorage.setItem('pdf_attempt_count', newCount.toString());
  console.log(`PDF attempt count: ${newCount}`);
  return newCount;
};

// Reset PDF attempt counter
export const resetPDFAttemptCounter = (): void => {
  localStorage.removeItem('pdf_attempt_count');
};

// Add PDF-specific options to FormData
export const addPDFOptions = (
  formData: FormData,
  options: any,
  pdfAttemptCount: number
): void => {
  formData.append("fileType", "pdf");
  console.log("PDF file detected. Adding special handling flags.");
  
  // Add special flags to ensure we're getting real data
  formData.append("extractRealData", "true");
  
  // Ensure useVision flag is explicitly set to true
  const useVision = options?.useVision !== false; // Default to true unless explicitly set to false
  formData.append("useVision", useVision ? "true" : "false");
  console.log(`Setting useVision flag to: ${useVision}`);
  
  // Add debug mode to get more information about the Google Vision API
  formData.append("debugMode", "true");
  
  formData.append("forceRealData", options?.forceRealData ? "true" : "false");
  
  if (options?.context) {
    formData.append("context", options.context);
  }
  
  // Add safe processing option to prevent stack overflows
  formData.append("safeProcessing", options?.safeProcessing ? "true" : "false");
  
  // Make sure to force using Google Vision API
  if (useVision) {
    formData.append("FORCE_VISION_API", "true");
    console.log("Adding FORCE_VISION_API flag to ensure Vision API is used");
  }
  
  // After multiple attempts with the same PDF, try a different approach
  if (pdfAttemptCount > 3) {
    console.log("Multiple PDF attempts detected, using enhanced PDF handling");
    formData.append("enhancedPdfMode", "true");
    // Force base64 encoding on multiple attempts
    formData.append("forceBase64", "true");
  }
};
