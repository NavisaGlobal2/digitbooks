
import { ParsedTransaction } from "./parsers";
import { ExpenseCategory } from "@/types/expense";
import { useTagSelection } from "./tagging/useTagSelection";
import { useCategoryAssignment } from "./tagging/useCategoryAssignment";
import { useTransactionValidation } from "./tagging/useTransactionValidation";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  console.log(`useTransactionTagging initialized with ${initialTransactions.length} transactions`);
  
  // Ensure each transaction has a unique ID
  const validatedTransactions = initialTransactions.map(t => ({
    ...t,
    id: t.id || uuidv4(), // Use a proper UUID library
    selected: t.type === 'debit' // Only pre-select debit transactions
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
      
      // Log category assignment stats
      const categorizedCount = taggedTransactions.filter(t => t.selected && t.category).length;
      const selectedCount = taggedTransactions.filter(t => t.selected).length;
      console.log(`Category assignment stats: ${categorizedCount}/${selectedCount} selected transactions have categories`);
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
