
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseViaEdgeFunction } from "./edge-function";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void,
  context: "revenue" | "expense" = "expense"
) => {
  toast.info("Processing PDF statement using OCR. This may take a moment...");
  
  // Log the file details for debugging
  console.log(`Starting PDF parsing for: ${file.name} (${file.size} bytes) with context: ${context}`);
  
  // ALWAYS ensure Vision API is enabled for PDFs for better results
  const options = {
    useVision: true, // Explicitly set to true to ensure Vision API is used
    forceRealData: true,
    context: context,
    extractRealData: true,
    noDummyData: true,
    safeProcessing: true,
    disableFakeDataGeneration: true,
    strictExtractMode: true,
    returnEmptyOnFailure: true,
    neverGenerateDummyData: true,
    debugMode: true // Add debug mode to get more info
  };
  
  console.log("PDF processing options:", options);
  
  // Send the file directly to the edge function with special PDF handling flag
  parseViaEdgeFunction(
    file,
    (transactions) => {
      console.log(`PDF successfully parsed with ${transactions.length} transactions`);
      
      if (!Array.isArray(transactions) || transactions.length === 0) {
        toast.warning(`No ${context} transactions were found in your PDF. Please try a different file or format.`);
        onError(`No ${context} transactions found in PDF. Please try a different file.`);
        return;
      }
      
      // Check for Vision API success marker
      const visionApiUsed = transactions.some(tx => 
        tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') ||
        tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
      );
      
      console.log("Vision API used successfully:", visionApiUsed);
      
      // Filter out any marker transactions
      const processedTransactions = transactions.filter(tx => {
        // Filter out any marker transactions
        if (tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') ||
            tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')) {
          return false;
        }
        
        if (tx.date) {
          // Ensure date is in YYYY-MM-DD format
          try {
            const dateObj = new Date(tx.date);
            if (!isNaN(dateObj.getTime())) {
              tx.date = dateObj.toISOString().split('T')[0];
            }
          } catch (e) {
            console.warn("Could not format date:", tx.date);
          }
        }
        
        // Validate each transaction to ensure it has required fields
        if (!tx.description || tx.description.trim() === '') {
          return false; // Skip transactions with empty descriptions
        }
        
        if (isNaN(parseFloat(String(tx.amount)))) {
          console.warn("Invalid amount detected:", tx.amount);
          return false; // Skip transactions with invalid amounts
        }
        
        return true;
      }) as ParsedTransaction[];
      
      if (processedTransactions.length === 0) {
        toast.warning(`No valid ${context} transactions were found in your PDF. Please try a different file.`);
        onError(`No valid ${context} transactions found in PDF. Please try a different file.`);
        return;
      }
      
      console.log(`${context} PDF transactions after processing:`, processedTransactions);
      onComplete(processedTransactions);
    },
    (errorMessage) => {
      console.error("PDF parsing error:", errorMessage);
      
      // Check for specific Vision API errors
      if (errorMessage.includes("Google Vision API") || 
          errorMessage.includes("Vision API") ||
          errorMessage.includes("vision")) {
        toast.error("Google Vision API error. This might be due to missing API keys or configuration issues.");
        onError("Google Vision API failed to extract text from your PDF. Please try again or use a CSV format if available.");
      } 
      // For typical stack overflow errors, provide clear guidance
      else if (errorMessage.includes("Maximum call stack size exceeded") || 
          errorMessage.includes("operation is not supported") ||
          errorMessage.includes("sandbox environment internal error")) {
        toast.warning("Technical issue with PDF processing. Please try uploading a CSV version if available.");
        onError("Technical limitation: PDF processing cannot extract text directly. Please try uploading the PDF again or use a CSV format if possible.");
      } else if (errorMessage.includes("No transactions found") || errorMessage.includes("empty array")) {
        toast.warning(`No ${context} transactions were found in your PDF. Please check if this statement contains transaction data.`);
        onError(`No ${context} transactions found in PDF. Please verify this is a bank statement with transaction data.`);
      } else {
        onError(`PDF parsing failed: ${errorMessage}`);
      }
      return true;
    },
    options
  );
};
