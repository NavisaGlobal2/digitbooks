
import { ExpenseCategory } from "@/types/expense";
import { ParsedTransaction } from "../parsers/types";
import { useCallback } from "react";

export const useCategoryAssignment = (
  taggedTransactions: ParsedTransaction[],
  setTaggedTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>
) => {
  // Derived state
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;

  // Set category for a single transaction - ensuring it only affects the specified transaction
  const handleSetCategory = useCallback((id: string, category: ExpenseCategory) => {
    console.log(`Setting category ${category} for transaction ${id} ONLY`);
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.id === id ? { ...t, category } : t
      )
    );
  }, [setTaggedTransactions]);

  // Set category only for selected transactions
  const handleSetCategoryForAll = useCallback((category: ExpenseCategory) => {
    console.log(`Setting category ${category} for ALL SELECTED transactions only`);
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(t => 
        t.selected ? { ...t, category } : t
      )
    );
  }, [setTaggedTransactions]);

  return {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
