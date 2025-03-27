
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";
import { v4 as uuidv4 } from 'uuid';

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  console.log(`useTagSelection in tagging folder INITIALIZED with ${initialTransactions.length} transactions`);
  
  // Initialize with valid IDs and selected=false
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(() => {
    // Ensure each transaction has a unique ID
    const validatedTransactions = initialTransactions.map(t => ({
      ...t,
      id: t.id || uuidv4(),
      selected: false // Start with no selection
    }));
    
    console.log(`Initialized ${validatedTransactions.length} transactions with selected=false`);
    
    // Log IDs for debugging
    if (validatedTransactions.length > 0) {
      console.log(`Sample transaction IDs: ${validatedTransactions.slice(0, 3).map(t => t.id).join(", ")}`);
    }
    
    return validatedTransactions;
  });

  // Track select all state separately
  const [selectAll, setSelectAll] = useState(false);

  // Derived state for metrics
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  // Log whenever selection state changes
  useEffect(() => {
    console.log(`Selection state changed: ${selectedCount}/${taggedTransactions.length} transactions selected`);
    
    if (selectedCount > 0) {
      const selectedIds = taggedTransactions
        .filter(t => t.selected)
        .map(t => t.id)
        .slice(0, 3)
        .join(", ");
      
      console.log(`First few selected transaction IDs: ${selectedIds}${selectedCount > 3 ? '...' : ''}`);
    }
  }, [selectedCount, taggedTransactions]);
  
  const handleSelectAll = useCallback((checked: boolean) => {
    console.log(`Select all changed to: ${checked}`);
    setSelectAll(checked);
    
    setTaggedTransactions(prevTransactions => {
      const updated = prevTransactions.map(t => ({
        ...t,
        selected: checked && t.type === 'debit' // Only select debits
      }));
      
      console.log(`After selectAll=${checked}: ${updated.filter(t => t.selected).length}/${updated.length} transactions selected`);
      
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
      // Find the transaction being updated
      const transaction = prevTransactions.find(t => t.id === id);
      if (!transaction) {
        console.error(`Transaction with ID ${id} not found in current state`);
        console.log("Available transaction IDs:", prevTransactions.slice(0, 5).map(t => t.id).join(", "));
        return prevTransactions;
      }
      
      // Create a new array with the updated transaction
      const updated = prevTransactions.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
      
      // Update selectAll state if appropriate
      const allDebitsSelected = updated.filter(t => t.type === 'debit').every(t => t.selected);
      const noDebitsSelected = updated.filter(t => t.type === 'debit').every(t => !t.selected);
      
      if (allDebitsSelected !== selectAll && allDebitsSelected) {
        setSelectAll(true);
      } else if (noDebitsSelected && selectAll) {
        setSelectAll(false);
      }
      
      console.log(`After selection change for ${id}: ${updated.filter(t => t.selected).length} transactions selected`);
      
      return updated;
    });
  }, [selectAll]);

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
