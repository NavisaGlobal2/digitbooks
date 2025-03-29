
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseViaEdgeFunction } from "./edge-function";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  toast.info("Processing PDF statement using AI. This may take a moment...");
  
  // We'll use the edge function approach directly for PDF files
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
      
      if (errorMessage.includes("Maximum call stack size exceeded") || 
          errorMessage.includes("operation is not supported")) {
        toast.warning("PDF processing requires special handling. Please try again and the system will process it differently on second attempt.");
        onError("This PDF requires a second attempt due to its complexity. Please try uploading again.");
      } else {
        onError(`PDF parsing failed: ${errorMessage}`);
      }
      return true;
    },
    "anthropic" // Use Anthropic as default for PDFs as it tends to handle them better
  );
};
