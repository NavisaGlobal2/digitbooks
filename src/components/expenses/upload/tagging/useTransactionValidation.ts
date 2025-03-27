
import { useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTransactionValidation = (transactions: ParsedTransaction[]) => {
  const [isReadyToSave, setIsReadyToSave] = useState(false);

  useEffect(() => {
    // Check if all selected transactions have categories
    const selectedTransactions = transactions.filter(t => t.selected);
    const allTagged = selectedTransactions.length > 0 && 
                      selectedTransactions.every(t => t.category);
    setIsReadyToSave(allTagged);
  }, [transactions]);

  return {
    isReadyToSave
  };
};
