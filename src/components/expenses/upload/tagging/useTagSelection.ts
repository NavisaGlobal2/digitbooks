
import { useState } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [selectAll, setSelectAll] = useState(false); // Changed default to false to avoid auto-selecting all

  // Effect to handle initial state removed - we'll let users explicitly select items

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
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
