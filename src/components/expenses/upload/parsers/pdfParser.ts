
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
      
      // Enhanced validation to detect AI-generated content
      const suspiciousTransactions = detectSuspiciousTransactions(transactions);
      if (suspiciousTransactions.length > 0) {
        console.warn("Suspicious transactions detected:", suspiciousTransactions);
        toast.error("The system may have generated example data instead of extracting real transactions. Please try again with a CSV file format.");
        onError("AI returned placeholder data instead of real transactions. Please try again with a different file format.");
        return;
      }
      
      // Ensure transactions have proper dates
      const processedTransactions = transactions.map(tx => {
        // Filter out any marker transactions
        if (tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') ||
            tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')) {
          return null;
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
          tx.description = 'Unspecified transaction';
        }
        
        if (isNaN(parseFloat(String(tx.amount)))) {
          console.warn("Invalid amount detected:", tx.amount);
          tx.amount = 0;
        }
        
        return tx;
      }).filter(tx => tx !== null) as ParsedTransaction[];
      
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

/**
 * Enhanced detection of suspicious/AI-generated transactions
 */
function detectSuspiciousTransactions(transactions: ParsedTransaction[]): ParsedTransaction[] {
  // Filter out any marker transactions first
  const filteredTransactions = transactions.filter(tx => 
    !tx.description?.includes('VISION_API_EXTRACTION_SUCCESS_MARKER') &&
    !tx.amount?.toString().includes('VISION_API_EXTRACTION_SUCCESS_MARKER')
  );
  
  // Common patterns in AI-generated example data
  const suspiciousTerms = [
    'placeholder', 'example', 'sample', 'dummy', 'test transaction', 'demo',
    'john doe', 'jane doe', 'grocery', 'coffee', 'netflix', 'amazon', 'uber', 
    'walmart', 'target', 'starbucks', 'restaurant', 'gas station', 'market',
    'payroll', 'salary', 'deposit', 'withdrawal', 'transfer', 'payment',
    '12345', '10.00', '20.00', '50.00', '100.00' // Common placeholder amounts
  ];
  
  // Find transactions that are likely AI-generated
  const suspicious = filteredTransactions.filter(tx => {
    // Check if description contains suspicious terms
    if (tx.description && suspiciousTerms.some(term => 
      tx.description.toLowerCase().includes(term.toLowerCase()))) {
      return true;
    }
    
    // Check for suspiciously round amounts (e.g., exactly 100.00)
    const amount = parseFloat(String(tx.amount));
    if (amount === Math.floor(amount) && amount >= 10 && amount <= 1000) {
      return true;
    }
    
    return false;
  });
  
  // Reject if all transaction dates are perfectly sequential (likely fake data)
  if (filteredTransactions.length > 3) {
    let sequentialDateCount = 0;
    const sortedTxs = [...filteredTransactions].sort((a, b) => {
      if (!a.date || !b.date) return 0;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    for (let i = 1; i < sortedTxs.length; i++) {
      if (!sortedTxs[i-1].date || !sortedTxs[i].date) continue;
      
      const prevDate = new Date(sortedTxs[i-1].date);
      const currDate = new Date(sortedTxs[i].date);
      
      if (isNaN(prevDate.getTime()) || isNaN(currDate.getTime())) continue;
      
      const diffDays = (currDate.getTime() - prevDate.getTime()) / (1000 * 3600 * 24);
      
      if (diffDays === 1 || diffDays === 7 || diffDays === 30) {
        sequentialDateCount++;
      }
    }
    
    // If more than 70% of dates are sequential, it's likely fake data
    if (sequentialDateCount > sortedTxs.length * 0.7) {
      console.warn("Warning: Detected suspiciously sequential dates in transactions");
      return filteredTransactions; // Return all transactions to trigger the error
    }
  }
  
  return suspicious;
}
