
import { useState, useCallback, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";
import { v4 as uuidv4 } from 'uuid';

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to initialize transactions with selected=false and ensure IDs exist
  useEffect(() => {
    // Create a new array with guaranteed IDs for all transactions
    const transactionsWithIds = initialTransactions.map(transaction => {
      if (!transaction.id) {
        console.log("Found transaction without ID, generating one");
      }
      
      // Always generate a new ID to ensure uniqueness
      const id = uuidv4();
      
      return {
        ...transaction,
        id,
        selected: false // Start with all transactions unselected
      };
    });
    
    console.log(`Generated IDs for ${transactionsWithIds.length} transactions`);
    transactionsWithIds.forEach(t => console.log(`Transaction [${t.id}]: Type=${t.type}, Amount=${t.amount}, Description=${t.description.substring(0, 20)}`));
    
    setTaggedTransactions(transactionsWithIds);
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
    console.log(`Selecting transaction: ID=${id}, Checked=${checked}`);
    
    if (!id) {
      console.error("ERROR: Attempted to select transaction with undefined ID");
      return;
    }
    
    setTaggedTransactions(prevTransactions => {
      // Find the transaction being updated to verify it exists
      const targetTransaction = prevTransactions.find(t => t.id === id);
      
      if (!targetTransaction) {
        console.error(`ERROR: Transaction with ID ${id} not found`);
        console.log("Available IDs:", prevTransactions.map(t => t.id).join(", "));
        return prevTransactions;
      }
      
      // Log the transaction being updated
      console.log(`Found transaction to update:`, targetTransaction);
      
      // Create a new array with the updated transaction
      const updatedTransactions = prevTransactions.map(transaction => {
        if (transaction.id === id) {
          return { ...transaction, selected: checked };
        }
        return transaction;
      });
      
      const newSelectedCount = updatedTransactions.filter(t => t.selected).length;
      console.log(`After selection, ${newSelectedCount} transactions are selected`);
      
      return updatedTransactions;
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
