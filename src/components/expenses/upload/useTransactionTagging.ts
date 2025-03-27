
import { useState, useEffect } from "react";
import { ParsedTransaction } from "./statementParsers";
import { ExpenseCategory } from "@/types/expense";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [selectAll, setSelectAll] = useState(true);
  const [isReadyToSave, setIsReadyToSave] = useState(false);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  const taggedCount = taggedTransactions.filter(t => t.selected && t.category).length;

  useEffect(() => {
    // Check if all selected transactions have categories
    const selectedTransactions = taggedTransactions.filter(t => t.selected);
    const allTagged = selectedTransactions.length > 0 && 
                      selectedTransactions.every(t => t.category);
    setIsReadyToSave(allTagged);
  }, [taggedTransactions]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(taggedTransactions.map(t => ({
      ...t,
      selected: checked && t.type === 'debit' // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, selected: checked } : t
    ));
  };

  const handleSetCategory = (id: string, category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.id === id ? { ...t, category } : t
    ));
  };

  const handleSetCategoryForAll = (category: ExpenseCategory) => {
    setTaggedTransactions(taggedTransactions.map(t => 
      t.selected ? { ...t, category } : t
    ));
  };

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
