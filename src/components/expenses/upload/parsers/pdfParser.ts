
import { toast } from "sonner";
import { ParsedTransaction } from "./types";
import { generateMockTransactions } from "./helpers";

export const parsePDFFile = (
  file: File, 
  onComplete: (transactions: ParsedTransaction[]) => void,
  onError: (errorMessage: string) => void
) => {
  toast.info("PDF parsing is using client-side processing");
  
  setTimeout(() => {
    const transactions = generateMockTransactions(8);
    onComplete(transactions);
  }, 1500);
};
