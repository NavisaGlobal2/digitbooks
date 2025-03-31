
import { toast } from "sonner";
import { ParsedTransaction } from "./types";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  // PDF parsing now always redirects to server-side processing
  const message = "PDF parsing is being handled by the server. " +
    "Your statement data is being processed for the most accurate results.";
  
  toast.info(message);
  
  // The actual processing will happen via the edge function
  // This function now returns early to prevent client-side parsing attempts
  onError(
    "PDF statement processing in progress. " +
    "Please wait while our AI extracts transaction data from your PDF statement."
  );
};
