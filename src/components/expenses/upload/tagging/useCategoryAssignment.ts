
import { ExpenseCategory } from "@/types/expense";
import { ParsedTransaction } from "../parsers/types";

export const useCategoryAssignment = (
  taggedTransactions: ParsedTransaction[],
  setTaggedTransactions: React.Dispatch<React.SetStateAction<ParsedTransaction[]>>
) => {
  // Derived state
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;

  // Set category for a single transaction
  const handleSetCategory = (id: string, category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, category } : t
    ));
  };

  // Set category only for selected transactions
  const handleSetCategoryForAll = (category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.selected ? { ...t, category } : t
    ));
  };

  return {
    taggedCount,
    handleSetCategory,
    handleSetCategoryForAll
  };
};
