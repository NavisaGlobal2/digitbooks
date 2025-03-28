
import { useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [selectAll, setSelectAll] = useState(false); // Changed to default false instead of true

  // Effect to handle initial state - allow user to select transactions individually
  useEffect(() => {
    // Set initial transactions without automatically selecting them
    const updatedTransactions = initialTransactions.map(t => ({
      ...t,
      selected: false // Don't select any by default
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
    // This is the key fix - we need to only update the selected transaction by ID
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    ));
    
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
