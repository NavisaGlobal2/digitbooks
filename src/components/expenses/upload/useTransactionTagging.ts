
import { ParsedTransaction } from "./parsers";
import { ExpenseCategory } from "@/types/expense";
import { useTagSelection } from "./tagging/useTagSelection";
import { useCategoryAssignment } from "./tagging/useCategoryAssignment";
import { useTransactionValidation } from "./tagging/useTransactionValidation";
import { useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  console.log(`useTransactionTagging initialized with ${initialTransactions.length} transactions`);
  
  // Ensure each transaction has a unique ID before passing to hooks
  const validatedTransactions = initialTransactions.map(t => ({
    ...t,
    id: t.id || uuidv4(), // Use UUID for reliable unique IDs
    selected: false // Always initialize with selected=false
  }));
  
  // Log all transaction IDs for debugging
  console.log("Transaction IDs before hooks:", validatedTransactions.map(t => t.id).join(", "));
  
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

  // Add debugging to track transaction IDs and selection state
  useEffect(() => {
    if (taggedTransactions.length > 0) {
      const selectedTransactions = taggedTransactions.filter(t => t.selected);
      console.log(`Current transaction state: ${taggedTransactions.length} total, ${selectedTransactions.length} selected`);
      
      if (selectedTransactions.length > 0) {
        console.log("Selected transaction IDs:", 
          selectedTransactions.map(t => t.id).join(", ")
        );
      }
      
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
