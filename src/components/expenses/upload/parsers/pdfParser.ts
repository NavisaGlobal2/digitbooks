
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
  // This provides a consistent approach with how we handle CSVs
  parseViaEdgeFunction(
    file,
    (transactions) => {
      console.log(`PDF successfully parsed with ${transactions.length} transactions`);
      onComplete(transactions);
    },
    (errorMessage) => {
      console.error("PDF parsing error:", errorMessage);
      
      // If this is the first attempt, suggest trying again
      if (errorMessage.includes("requires a second attempt")) {
        toast.warning("PDF processing requires a second attempt. Please try uploading the PDF again.");
      } else {
        onError(`PDF parsing failed: ${errorMessage}`);
      }
      return true;
    },
    "anthropic" // Use Anthropic as default for PDFs as it tends to handle them better
  );
};
