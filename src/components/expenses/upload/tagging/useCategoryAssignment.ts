
import { ExpenseCategory } from "@/types/expense";
import { ParsedTransaction } from "../parsers/types";
import { useCallback, useState, useEffect } from "react";

export const useCategoryAssignment = (
  taggedTransactions: ParsedTransaction[],
  setTaggedTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>
) => {
  // Derived state
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;

  // Set category for a single transaction - ensuring it only affects the specified transaction
  const handleSetCategory = useCallback((id: string, category: ExpenseCategory) => {
    if (!id) {
      console.error("Attempted to set category with undefined transaction ID");
      return;
    }
    
    console.log(`Setting category ${category} for transaction ${id} ONLY`);
    
    setTaggedTransactions(prevTransactions => {
      // Find the transaction to update
      const transactionToUpdate = prevTransactions.find(t => t.id === id);
      if (!transactionToUpdate) {
        console.error(`Transaction with ID ${id} not found`);
        return prevTransactions;
      }
      
      // Return a new array with the updated transaction
      return prevTransactions.map(t => 
        t.id === id ? { ...t, category } : t
      );
    });
  }, [setTaggedTransactions]);

  // Set category only for selected transactions
  const handleSetCategoryForAll = useCallback((category: ExpenseCategory) => {
    console.log(`Setting category ${category} for ALL SELECTED transactions only`);
    
    setTaggedTransactions(prevTransactions => {
      // Create a new array with updated transactions
      return prevTransactions.map(t => 
        t.selected ? { ...t, category } : t
      );
    });
  }, [setTaggedTransactions]);

  return {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
