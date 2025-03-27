
import { useState, useEffect, useCallback } from "react";
import { ParsedTransaction } from "./parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to handle initial state - ensure transactions are NOT selected by default
  useEffect(() => {
    // Initialize transactions with selected=false
    const updatedTransactions = initialTransactions.map(t => ({
      ...t,
      selected: false // Default to not selected
    }));
    
    setTaggedTransactions(updatedTransactions);
    
    // Log counts for debugging
    const debitCount = updatedTransactions.filter(t => t.type === 'debit').length;
    const selectedCount = updatedTransactions.filter(t => t.selected).length;
    console.log(`Initial transactions: ${updatedTransactions.length} total, ${debitCount} debits, ${selectedCount} selected`);
  }, [initialTransactions]);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  const handleSelectAll = useCallback((checked: boolean) => {
    console.log(`Select all changed to: ${checked}`);
    setSelectAll(checked);
    setTaggedTransactions(prevTransactions => prevTransactions.map(t => ({
      ...t,
      selected: checked && t.type === 'debit' // Only select debits
    })));
  }, []);

  const handleSelectTransaction = useCallback((id: string, checked: boolean) => {
    console.log(`Transaction ${id} selection changed to: ${checked}`);
    setTaggedTransactions(prevTransactions => prevTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    ));
  }, []);

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
