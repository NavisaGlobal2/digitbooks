
import { useCallback, useState, useEffect } from "react";
import { ParsedTransaction } from "../parsers/types";
import { ExpenseCategory } from "@/types/expense";

export const useCategoryAssignment = (
  transactions: ParsedTransaction[], 
  setTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>
) => {
  // Track the count of tagged transactions
  const [taggedCount, setTaggedCount] = useState(0);
  
  // Update tagged count when transactions change
  useEffect(() => {
    const count = transactions.filter(t => t.selected && t.category).length;
    setTaggedCount(count);
    console.log(`Tagged count updated: ${count} transactions have categories`);
  }, [transactions]);
  
  const handleSetCategory = useCallback((id: string, category: ExpenseCategory) => {
    console.log(`Setting category ${category} for transaction ${id}`);
    
    if (!id) {
      console.error("Attempted to set category for transaction with undefined ID");
      return;
    }
    
    setTransactions(prevTransactions => {
      // Verify the transaction exists first
      const transaction = prevTransactions.find(t => t.id === id);
      if (!transaction) {
        console.error(`Transaction with ID ${id} not found when setting category`);
        console.log("Available transaction IDs:", prevTransactions.map(t => t.id).join(", "));
        return prevTransactions;
      }
      
      // Update the category
      const updated = prevTransactions.map(t => 
        t.id === id ? { ...t, category } : t
      );
      
      console.log(`After setting category for ${id}: ${updated.filter(t => t.selected && t.category).length} transactions are tagged`);
      
      return updated;
    });
  }, [setTransactions]);
  
  const handleSetCategoryForAll = useCallback((category: ExpenseCategory) => {
    console.log(`Setting category ${category} for all selected transactions`);
    
    setTransactions(prevTransactions => {
      const updated = prevTransactions.map(t => 
        t.selected ? { ...t, category } : t
      );
      
      const taggedCount = updated.filter(t => t.selected && t.category).length;
      console.log(`After bulk category assignment: ${taggedCount} transactions are tagged`);
      
      return updated;
    });
  }, [setTransactions]);
  
  return {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
