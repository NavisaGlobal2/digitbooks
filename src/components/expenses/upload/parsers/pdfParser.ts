
import { toast } from "sonner";
import { ParsedTransaction } from "./types";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  // PDF parsing now always redirects to server-side processing
  const message = "PDF parsing is being handled by the server. " +
    "Please use the 'Server-side processing' option to parse PDF statements for the most accurate results.";
  
  toast.info(message);
  
  onError(
    "PDF parsing requires server-side processing due to security limitations. " +
    "Please use the 'Server-side processing' option which leverages AI to extract transactions from your PDF statement."
  );
};
