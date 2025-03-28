
import { ParsedTransaction } from "./parsers/types";
import { ExpenseCategory } from "@/types/expense";
import { useState, useEffect } from "react";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  // Store transactions state directly in this hook
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to initialize transactions without automatically selecting them
  useEffect(() => {
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

  // Selection handling
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(prev => prev.map(t => ({
      ...t,
      selected: t.type === 'debit' ? checked : false // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    // Update only the selected transaction by ID
    setTaggedTransactions(prev => {
      const updated = prev.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
      
      // Update selectAll state based on whether all debit transactions are selected
      const allDebitsSelected = updated
        .filter(t => t.type === 'debit')
        .every(t => t.selected);
        
      setSelectAll(allDebitsSelected);
      
      return updated;
    });
  };

  // Category assignment
  const handleSetCategory = (id: string, category: ExpenseCategory) => {
    // Update only the transaction with the matching ID
    setTaggedTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, category } : t
    ));
  };

  const handleSetCategoryForAll = (category: ExpenseCategory) => {
    // Update only selected transactions
    setTaggedTransactions(prev => prev.map(t => 
      t.selected ? { ...t, category } : t
    ));
  };

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;
  
  // Validation
  const isReadyToSave = selectedCount > 0 && 
    taggedTransactions.filter(t => t.selected).every(t => t.category);

  return {
    taggedTransactions,
    selectAll,
    isReadyToSave,
    selectedCount,
    debitCount,
    taggedCount,
    handleSelectAll,
    handleSelectTransaction,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
