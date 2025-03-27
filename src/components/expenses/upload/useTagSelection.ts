
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "./parsers/types";
import { v4 as uuidv4 } from 'uuid';

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  console.log(`useTagSelection INITIALIZED with ${initialTransactions.length} transactions`);
  
  // Initialize transactions with IDs and selected=false
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(() => {
    // Ensure each transaction has a unique ID and selected=false
    const transactions = initialTransactions.map(t => ({
      ...t,
      id: t.id || uuidv4(),
      selected: false
    }));
    
    console.log(`useTagSelection STATE initialized with ${transactions.length} transactions`);
    if (transactions.length > 0) {
      console.log(`First few transaction IDs: ${transactions.slice(0, 3).map(t => t.id).join(', ')}`);
    }
    
    return transactions;
  });
  
  // State for select all checkbox
  const [selectAll, setSelectAll] = useState(false);

  // Derived state for counts
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  // Log transactions whenever they change
  useEffect(() => {
    console.log(`Tagged transactions updated: ${taggedTransactions.length} total, ${selectedCount} selected`);
    if (selectedCount > 0) {
      console.log(`Selected transaction IDs: ${taggedTransactions.filter(t => t.selected).map(t => t.id).slice(0, 3).join(', ')}${selectedCount > 3 ? '...' : ''}`);
    }
  }, [taggedTransactions, selectedCount]);
  
  // Handler for select all checkbox
  const handleSelectAll = useCallback((checked: boolean) => {
    console.log(`handleSelectAll called with checked=${checked}`);
    setSelectAll(checked);
    
    setTaggedTransactions(prevTransactions => {
      const updated = prevTransactions.map(t => ({
        ...t,
        selected: checked && t.type === 'debit' // Only select debits
      }));
      
      console.log(`After selectAll=${checked}, ${updated.filter(t => t.selected).length} transactions are selected`);
      return updated;
    });
  }, []);

  // Handler for individual transaction selection
  const handleSelectTransaction = useCallback((id: string, checked: boolean) => {
    console.log(`handleSelectTransaction called with id=${id}, checked=${checked}`);
    
    if (!id) {
      console.error("Attempted to select transaction with undefined ID");
      return;
    }
    
    setTaggedTransactions(prevTransactions => {
      // First verify the transaction exists
      const transactionExists = prevTransactions.some(t => t.id === id);
      if (!transactionExists) {
        console.error(`Transaction with ID ${id} not found in current state`);
        console.log(`Available IDs: ${prevTransactions.map(t => t.id).slice(0, 5).join(', ')}...`);
        return prevTransactions;
      }
      
      // Create a new array with the updated transaction
      const updated = prevTransactions.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
      
      // Update selectAll state based on whether all debit transactions are selected
      const allDebitsSelected = updated.filter(t => t.type === 'debit').every(t => t.selected);
      setSelectAll(allDebitsSelected);
      
      console.log(`After selection of ${id}, ${updated.filter(t => t.selected).length} transactions are selected`);
      
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
