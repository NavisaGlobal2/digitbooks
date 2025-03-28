import { useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(true);

  // Initialize transactions when they're received
  useEffect(() => {
    // Make a deep copy of transactions to avoid reference issues
    const transactionsWithSelectionState = initialTransactions.map(t => ({
      ...t,
      selected: t.type === 'debit' // Only select debits by default
    }));
    
    setTaggedTransactions(transactionsWithSelectionState);
    
    // Log for debugging
    console.log(`Initialized ${transactionsWithSelectionState.length} transactions, ${transactionsWithSelectionState.filter(t => t.selected).length} selected by default`);
  }, [initialTransactions]);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    
    // Update only debit transactions, leave credit transactions unchanged
    setTaggedTransactions(taggedTransactions.map(t => {
      if (t.type === 'debit') {
        return { ...t, selected: checked };
      }
      return t;
    }));
    
    console.log(`Select all changed to: ${checked}, affecting ${debitCount} debit transactions`);
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    console.log(`Selecting transaction ${id}, checked: ${checked}`);
    
    setTaggedTransactions(taggedTransactions.map(t => {
      if (t.id === id) {
        return { ...t, selected: checked };
      }
      return t;
    }));
    
    // Update selectAll state based on whether all debit transactions are selected
    const updatedTransactions = taggedTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    );
    
    const allDebitsSelected = updatedTransactions
      .filter(t => t.type === 'debit')
      .every(t => t.selected);
    
    setSelectAll(allDebitsSelected);
  };

  return {
    taggedTransactions,
    setTaggedTransactions,
    selectAll,
    selectedCount,
    debitCount,
    handleSelectAll,
    handleSelectTransaction
  };
};
