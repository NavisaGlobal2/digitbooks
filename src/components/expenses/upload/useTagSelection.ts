
import { useState, useEffect } from "react";
import { ParsedTransaction } from "./parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [selectAll, setSelectAll] = useState(true);

  // Effect to handle initial state - ensure debit transactions are selected by default
  useEffect(() => {
    // Make sure all debit transactions are selected by default
    const updatedTransactions = initialTransactions.map(t => ({
      ...t,
      selected: t.type === 'debit' // Only select debits by default
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
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(taggedTransactions.map(t => ({
      ...t,
      selected: checked && t.type === 'debit' // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    ));
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
