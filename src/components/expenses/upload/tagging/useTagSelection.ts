
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to initialize transactions with selected=false
  useEffect(() => {
    console.log("Initializing transactions with selected=false");
    const updatedTransactions = initialTransactions.map(t => ({
      ...t,
      selected: false // Start with all transactions unselected
    }));
    
    setTaggedTransactions(updatedTransactions);
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
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      )
    );
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
