
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to initialize transactions with selected=false
  useEffect(() => {
    console.log("Initializing transactions with selected=false");
    // Ensure each transaction has a unique ID before storing
    const updatedTransactions = initialTransactions.map(t => ({
      ...t,
      selected: false, // Start with all transactions unselected
      id: t.id || `trx-${Math.random().toString(36).substr(2, 9)}` // Ensure ID exists
    }));
    
    setTaggedTransactions(updatedTransactions);
    
    // Log IDs for debugging
    updatedTransactions.forEach(t => console.log(`Transaction initialized: ID=${t.id}`));
  }, [initialTransactions]);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  const handleSelectAll = useCallback((checked: boolean) => {
    console.log(`Select all changed to: ${checked}`);
    setSelectAll(checked);
    
    setTaggedTransactions(prevTransactions => {
      // Create a new array with updated selection state
      return prevTransactions.map(t => ({
        ...t,
        selected: checked && t.type === 'debit' // Only select debits
      }));
    });
  }, []);

  const handleSelectTransaction = useCallback((id: string, checked: boolean) => {
    if (!id) {
      console.error("Attempted to select transaction with undefined ID");
      return;
    }
    
    console.log(`Transaction ${id} selection changed to: ${checked}`);
    
    setTaggedTransactions(prevTransactions => {
      // Find the transaction to update
      const transactionToUpdate = prevTransactions.find(t => t.id === id);
      if (!transactionToUpdate) {
        console.error(`Transaction with ID ${id} not found in selection handler`);
        console.log("Available transaction IDs:", prevTransactions.map(t => t.id).join(", "));
        return prevTransactions;
      }
      
      // Return a new array with the updated transaction
      return prevTransactions.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
    });
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
