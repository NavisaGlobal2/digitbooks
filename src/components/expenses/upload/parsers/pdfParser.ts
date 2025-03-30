
import { toast } from "sonner";
import { ParsedTransaction } from "./types";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  toast.error("PDF parsing requires server-side processing.");
  
  onError(
    "PDF parsing is not supported in the client-side browser environment due to security limitations. " +
    "Please use the 'Server-side processing' option to parse PDF statements, or convert your statement to CSV/Excel format."
  );
};
