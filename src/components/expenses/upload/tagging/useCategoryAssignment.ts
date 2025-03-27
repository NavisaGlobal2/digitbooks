
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
      
      // Log before state
      console.log(`Before update: Transaction ${id} has category ${transactionToUpdate.category || 'none'}`);
      
      // Return a new array with the updated transaction
      const updatedTransactions = prevTransactions.map(t => 
        t.id === id ? { ...t, category } : t
      );
      
      // Verify the update was applied correctly
      const updatedTransaction = updatedTransactions.find(t => t.id === id);
      console.log(`After update: Transaction ${id} has category ${updatedTransaction?.category || 'none'}`);
      
      return updatedTransactions;
    });
  }, [setTaggedTransactions]);

  // Set category only for selected transactions
  const handleSetCategoryForAll = useCallback((category: ExpenseCategory) => {
    console.log(`Setting category ${category} for ALL SELECTED transactions only`);
    
    setTaggedTransactions(prevTransactions => {
      const selectedIds = prevTransactions.filter(t => t.selected).map(t => t.id);
      console.log(`Applying category to ${selectedIds.length} selected transactions: ${selectedIds.join(', ')}`);
      
      // Create a new array with updated transactions
      return prevTransactions.map(t => 
        t.selected ? { ...t, category } : t
      );
    });
  }, [setTaggedTransactions]);

  // Add effect to log category stats
  useEffect(() => {
    const categoryCounts = taggedTransactions.reduce((acc: Record<string, number>, t) => {
      if (t.category && t.selected) {
        acc[t.category] = (acc[t.category] || 0) + 1;
      }
      return acc;
    }, {});
    
    console.log("Category distribution:", categoryCounts);
  }, [taggedTransactions]);

  return {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
