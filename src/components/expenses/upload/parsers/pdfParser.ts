
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseViaEdgeFunction } from "./edge-function";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  toast.info("Processing PDF statement using AI. This may take a moment...");
  
  // Bypass text extraction completely for PDF files
  // Instead send the file directly to the edge function with a special flag
  parseViaEdgeFunction(
    file,
    (transactions) => {
      console.log(`PDF successfully parsed with ${transactions.length} transactions`);
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
        return tx;
      });
      onComplete(processedTransactions);
    },
    (errorMessage) => {
      console.error("PDF parsing error:", errorMessage);
      
      // For typical stack overflow errors, provide clear guidance
      if (errorMessage.includes("Maximum call stack size exceeded") || 
          errorMessage.includes("operation is not supported") ||
          errorMessage.includes("sandbox environment internal error")) {
        toast.warning("We're experiencing a technical issue with PDF processing. Please try uploading a CSV version if available.");
        onError("Technical limitation: PDF parsing in this environment is encountering issues. Please try a different format if possible.");
      } else {
        onError(`PDF parsing failed: ${errorMessage}`);
      }
      return true;
    },
    "anthropic" // Use Anthropic as default for PDFs as it tends to handle them better
  );
};
