
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { parseViaEdgeFunction } from "./edge-function";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  toast.info("Processing PDF statement using AI. This may take a moment...");
  
  // Send the file directly to the edge function with special PDF handling flag
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
      
      if (processedTransactions.length === 0) {
        toast.warning("No transactions were found in your PDF. Please try a different file or format.");
        onError("No transactions found in PDF. Please try a different file.");
        return;
      }
      
      onComplete(processedTransactions);
    },
    (errorMessage) => {
      console.error("PDF parsing error:", errorMessage);
      
      // For typical stack overflow errors, provide clear guidance
      if (errorMessage.includes("Maximum call stack size exceeded") || 
          errorMessage.includes("operation is not supported") ||
          errorMessage.includes("sandbox environment internal error")) {
        toast.warning("Technical issue with PDF processing. Please try uploading a CSV version if available.");
        onError("Technical limitation: PDF processing cannot extract text directly. Please try a different format if possible.");
      } else {
        onError(`PDF parsing failed: ${errorMessage}`);
      }
      return true;
    },
    "anthropic" // Use Anthropic as default for PDFs as it tends to handle them better
  );
};
