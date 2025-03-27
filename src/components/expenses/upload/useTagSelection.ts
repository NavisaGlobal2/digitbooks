
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "./parsers/types";
import { v4 as uuidv4 } from 'uuid';

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
      id: t.id || uuidv4() // Ensure ID exists using uuid
    }));
    
    setTaggedTransactions(updatedTransactions);
    
    // Log IDs for debugging
    console.log(`Initialized ${updatedTransactions.length} transactions with IDs:`);
    updatedTransactions.forEach(t => console.log(`Transaction ID=${t.id}, Type=${t.type}, Selected=${t.selected}`));
  }, [initialTransactions]);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  const handleSelectAll = useCallback((checked: boolean) => {
    console.log(`Select all changed to: ${checked}`);
    setSelectAll(checked);
    
    setTaggedTransactions(prevTransactions => {
      const updated = prevTransactions.map(t => ({
        ...t,
        selected: checked && t.type === 'debit' // Only select debits
      }));
      
      console.log(`Updated ${updated.length} transactions after selectAll=${checked}`);
      console.log(`Selected transactions after update: ${updated.filter(t => t.selected).length}`);
      
      return updated;
    });
  }, []);

  const handleSelectTransaction = useCallback((id: string, checked: boolean) => {
    if (!id) {
      console.error("Attempted to select transaction with undefined ID");
      return;
    }
    
    console.log(`Transaction ${id} selection changed to: ${checked}`);
    
    setTaggedTransactions(prevTransactions => {
      // Find the transaction being updated to verify it exists
      const transaction = prevTransactions.find(t => t.id === id);
      if (!transaction) {
        console.error(`Transaction with ID ${id} not found in current state`);
        console.log("Current transaction IDs:", prevTransactions.map(t => t.id).join(", "));
        return prevTransactions;
      }
      
      // Create a new array with the updated transaction
      const updated = prevTransactions.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
      
      console.log(`After selection change for ${id}, selected count: ${updated.filter(t => t.selected).length}`);
      
      return updated;
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
