
import { useFileProcessing } from "./useFileProcessing";
import { ParsedTransaction } from "../parsers";

interface UseProcessFileProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  isAuthenticated: boolean | null;
}

export const useProcessFile = ({ 
  onTransactionsParsed, 
  isAuthenticated 
}: UseProcessFileProps) => {
  const {
    processServerSide
  } = useFileProcessing({
    onTransactionsParsed,
    handleError: () => false,
    resetProgress: () => {},
    completeProgress: () => {},
    showFallbackMessage: () => {},
    isCancelled: false,
    setIsWaitingForServer: undefined
  });

  return {
    processServerSide
  };
};
