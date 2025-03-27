
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
  const validatedTransactions = initialTransactions.map(t => {
    const transaction = {
      ...t,
      id: t.id || uuidv4(), // Use UUID for reliable unique IDs
      selected: false // Always initialize with selected=false
    };
    
    return transaction;
  });
  
  // Log all transaction IDs for debugging
  useEffect(() => {
    if (validatedTransactions.length > 0) {
      console.log("Transaction IDs before hooks:", validatedTransactions.slice(0, 5).map(t => t.id).join(", "));
      console.log(`Generated IDs for ${validatedTransactions.length} transactions`);
      
      // Log details of first few transactions
      validatedTransactions.slice(0, 5).forEach(t => {
        console.log(`Transaction [${t.id}]: Type=${t.type}, Amount=${t.amount}, Description=${t.description?.substring(0, 20)}`);
      });
    }
  }, [validatedTransactions]);

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
