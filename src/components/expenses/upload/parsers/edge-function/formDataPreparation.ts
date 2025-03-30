
import { addPDFOptions, trackPDFAttempt, resetPDFAttemptCounter } from "./pdfHandler";

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
    
    // Force base64 encoding for Vision API to ensure proper format
    formData.append("forceBase64Encoding", "true");
    
    // Add new improved base64 flags
    formData.append("useSafeBase64", "true");
    formData.append("useChunkedBase64", "true");
    
    // Never generate dummy data - ENHANCED with stronger flags
    formData.append("neverGenerateDummyData", "true");
    formData.append("preventFakeData", "true");
    formData.append("strictExtractionOnly", "true");
    formData.append("extractRealTransactionsOnly", "true");
    formData.append("returnEmptyOnFailure", "true");
    
    // Add diagnostic flag for Vision API
    formData.append("returnVisionDiagnostics", "true");
    formData.append("includeExtractedText", "true");
    formData.append("preserveOriginalPdfText", "true");
    formData.append("rawTextOutput", "true");
    
    // Add flag to store PDF in Supabase
    formData.append("storePdfInSupabase", options?.storePdfInSupabase === true ? "true" : "false");
    
    // Log the options being used for debugging
    console.log("📋 PDF processing options being sent:", {
      isPdf,
      useVision: useVision ? "true" : "false",
      pdfAttemptCount,
      safeProcessing: options?.safeProcessing === true ? "true" : "false",
      forceBase64: "true",
      useSafeBase64: "true",
      useChunkedBase64: "true",
      debugMode: true,
      diagnosticMode: true,
      neverGenerateDummyData: true,
      preventFakeData: true,
      strictExtractionOnly: true,
      extractRealTransactionsOnly: true,
      returnEmptyOnFailure: true,
      returnVisionDiagnostics: true,
      includeExtractedText: true,
      preserveOriginalPdfText: true,
      rawTextOutput: true,
      storePdfInSupabase: options?.storePdfInSupabase === true ? "true" : "false"
    });
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
