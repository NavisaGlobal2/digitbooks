
import { ParsedTransaction } from "./parsers";
import { ExpenseCategory } from "@/types/expense";
import { useTagSelection } from "./tagging/useTagSelection";
import { useCategoryAssignment } from "./tagging/useCategoryAssignment";
import { useTransactionValidation } from "./tagging/useTransactionValidation";
import { useEffect } from "react";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  console.log(`useTransactionTagging initialized with ${initialTransactions.length} transactions`);
  
  // Ensure each transaction has a unique ID
  const validatedTransactions = initialTransactions.map(t => ({
    ...t,
    id: t.id || `trx-${Math.random().toString(36).substr(2, 9)}`
  }));
  
  const {
    taggedTransactions,
    setTaggedTransactions,
    selectAll,
    selectedCount,
    debitCount,
    handleSelectAll,
    handleSelectTransaction
  } = useTagSelection(validatedTransactions);

  const {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  } = useCategoryAssignment(taggedTransactions, setTaggedTransactions);

  const { isReadyToSave } = useTransactionValidation(taggedTransactions);

  // Add debugging to track transaction IDs
  useEffect(() => {
    if (taggedTransactions.length > 0) {
      console.log("Current transaction IDs:", 
        taggedTransactions.map(t => `${t.id}${t.selected ? ' (selected)' : ''}`).join(", ")
      );
    }
  }, [taggedTransactions]);

  return {
    taggedTransactions,
    selectAll,
    isReadyToSave,
    selectedCount,
    debitCount,
    taggedCount,
    handleSelectAll,
    handleSelectTransaction,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
