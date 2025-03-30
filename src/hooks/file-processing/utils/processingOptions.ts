
import { toast } from "sonner";

interface ProcessingOptions {
  useVision?: boolean;
  forceRealData?: boolean;
  context?: "revenue" | "expense";
  extractRealData?: boolean;
  noDummyData?: boolean;
  safeProcessing?: boolean;
  disableFakeDataGeneration?: boolean;
  strictExtractMode?: boolean;
  returnEmptyOnFailure?: boolean;
  neverGenerateDummyData?: boolean;
  debugMode?: boolean;
  storePdfInSupabase?: boolean;
  extractPdfText?: boolean;
  useOcrSpace?: boolean;
  [key: string]: any;
}

export const createProcessingOptions = (
  provider: string = "anthropic",
  fileType: string = "csv", 
  additionalOptions: Record<string, any> = {}
): ProcessingOptions => {
  console.log(`Creating processing options for ${fileType} with provider ${provider}`, additionalOptions);
  
  // Base options that are mostly the same for all providers
  const options: ProcessingOptions = {
    useVision: additionalOptions?.useVision ?? true,
    forceRealData: true,
    context: additionalOptions?.context || "expense",
    extractRealData: true,
    noDummyData: true,
    safeProcessing: true,
    disableFakeDataGeneration: true,
    strictExtractMode: true,
    returnEmptyOnFailure: true,
    neverGenerateDummyData: true,
    debugMode: true,
    provider: provider,
    storePdfInSupabase: additionalOptions?.storePdfInSupabase || false,
    extractPdfText: additionalOptions?.extractPdfText || false,
    useOcrSpace: false // Always set to false since the API key is not available
  };

  // For PDF files, ensure Vision API is enabled
  if (fileType === 'pdf') {
    options.useVision = true;
    
    // OCR.space not available, so only look for extractPdfText
    if (additionalOptions?.extractPdfText) {
      console.log("🔍 Using special PDF text extraction with Vision API");
      toast.info("Using advanced PDF text extraction");
    }
  }

  // Provider-specific optimizations
  if (provider === 'anthropic') {
    options.anthropicMax = true;
    options.anthropicStrict = true;
    options.model = 'claude-3-opus-20240229';
  } 
  else if (provider === 'deepseek') {
    options.deepseekMax = true;
    options.model = 'deepseek-coder-v2';
  }
  else if (provider === 'openai') {
    options.openaiMax = true;
    options.model = 'gpt-4o';
  }
  
  return options;
};
