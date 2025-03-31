
import { ParsedTransaction } from "./parsers/types";
import { ExpenseCategory } from "@/types/expense";
import { useState, useEffect } from "react";
import { addCategorySuggestions } from "./utils/categoryPredictor";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  // Store transactions state directly in this hook
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // Effect to initialize transactions - auto-select debit transactions by default
  useEffect(() => {
    if (initialTransactions && initialTransactions.length > 0) {
      // Generate unique IDs and apply category suggestions before updating state
      const transactionsWithIds = initialTransactions.map(t => ({
        ...t,
        // Auto-select debit transactions by default
        selected: t.type === 'debit',
        id: t.id || `transaction-${Math.random().toString(36).substr(2, 9)}` // Ensure each transaction has an ID
      }));
      
      // Add AI-powered category suggestions
      const transactionsWithSuggestions = addCategorySuggestions(transactionsWithIds);
      
      // Apply suggested categories to selected transactions that don't have a category yet
      const updatedTransactions = transactionsWithSuggestions.map(t => {
        if (t.selected && !t.category && t.categorySuggestion && t.categorySuggestion.confidence > 0.65) {
          return {
            ...t,
            category: t.categorySuggestion.category
          };
        }
        return t;
      });
      
      setTaggedTransactions(updatedTransactions);
      
      // Set selectAll based on if all debit transactions are selected
      const debitCount = updatedTransactions.filter(t => t.type === 'debit').length;
      const selectedCount = updatedTransactions.filter(t => t.selected).length;
      setSelectAll(debitCount > 0 && selectedCount === debitCount);
      
      // Log counts for debugging
      console.log(`Initial transactions: ${updatedTransactions.length} total, ${debitCount} debits, ${selectedCount} selected`);
    }
  }, [initialTransactions]);

  // Selection handling
  const handleSelectAll = (checked: boolean) => {
    console.log(`Select all changed to: ${checked}`);
    setSelectAll(checked);
    
    setTaggedTransactions(prev => prev.map(t => ({
      ...t,
      selected: t.type === 'debit' ? checked : false // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    console.log(`Transaction ${id} selection changed to: ${checked}`);
    
    // Update only the selected transaction by ID
    setTaggedTransactions(prev => {
      const updated = prev.map(t => 
        t.id === id ? { ...t, selected: checked } : t
      );
      
      // Update selectAll state based on whether all debit transactions are selected
      const debitTransactions = updated.filter(t => t.type === 'debit');
      const allDebitsSelected = debitTransactions.length > 0 && 
        debitTransactions.every(t => t.selected);
        
      setSelectAll(allDebitsSelected);
      
      return updated;
    });
  };

  // Category assignment
  const handleSetCategory = (id: string, category: ExpenseCategory) => {
    console.log(`Setting category for ${id}: ${category}`);
    
    // Update only the transaction with the matching ID
    setTaggedTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, category } : t
    ));
  };

  const handleSetCategoryForAll = (category: ExpenseCategory) => {
    console.log(`Setting category for all selected: ${category}`);
    
    // Update only selected transactions
    setTaggedTransactions(prev => prev.map(t => 
      t.selected ? { ...t, category } : t
    ));
  };

  // Apply all suggested categories with confidence above threshold
  const handleApplyAllSuggestions = (confidenceThreshold = 0.65) => {
    setTaggedTransactions(prev => prev.map(t => {
      if (t.selected && t.categorySuggestion && t.categorySuggestion.confidence >= confidenceThreshold) {
        return {
          ...t,
          category: t.categorySuggestion.category
        };
      }
      return t;
    }));
  };

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;
  const suggestedCount = taggedTransactions.filter(t => t.selected && t.categorySuggestion && t.categorySuggestion.confidence > 0.5).length;
  
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
    suggestedCount,
    handleSelectAll,
    handleSelectTransaction,
    handleSetCategory,
    handleSetCategoryForAll,
    handleApplyAllSuggestions
  };
};
