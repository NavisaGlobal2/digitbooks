
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseViaEdgeFunction } from "./edge-function";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void,
  context: "revenue" | "expense" = "expense" // Add context parameter with default
) => {
  toast.info("Processing PDF statement using OCR. This may take a moment...");
  
  // Log the file details for debugging
  console.log(`Starting PDF parsing for: ${file.name} (${file.size} bytes) with context: ${context}`);
  
  // Send the file directly to the edge function with special PDF handling flag and context
  parseViaEdgeFunction(
    file,
    (transactions) => {
      console.log(`PDF successfully parsed with ${transactions.length} transactions`);
      
      if (transactions.length === 0) {
        toast.warning(`No ${context} transactions were found in your PDF. Please try a different file or format.`);
        onError(`No ${context} transactions found in PDF. Please try a different file.`);
        return;
      }
      
      // Ensure transactions have proper dates
      const processedTransactions = transactions.map(tx => {
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
      });
      
      // Additional validation - check for placeholder data indicators
      const suspiciousTerms = ['placeholder', 'example', 'sample', 'dummy', 'test transaction', 'demo'];
      const hasSuspiciousTransactions = processedTransactions.some(tx => 
        suspiciousTerms.some(term => tx.description.toLowerCase().includes(term))
      );
      
      if (hasSuspiciousTransactions) {
        console.warn("Warning: Detected potential placeholder transactions in AI output");
      }
      
      // Log data for better debugging
      console.log(`${context} PDF transactions after processing:`, processedTransactions);
      
      onComplete(processedTransactions);
    },
    (errorMessage) => {
      console.error("PDF parsing error:", errorMessage);
      
      // For typical stack overflow errors, provide clear guidance
      if (errorMessage.includes("Maximum call stack size exceeded") || 
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
    context // Pass context to the edge function to identify revenue vs expense PDFs
  );
};
