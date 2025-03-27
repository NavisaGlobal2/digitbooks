
import { useState } from "react";
import { ParsedTransaction } from "../parsers/types";

export const useTagSelection = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(
    // Initialize with all transactions not selected
    initialTransactions.map(transaction => ({
      ...transaction,
      selected: false
    }))
  );
  const [selectAll, setSelectAll] = useState(false);

  // Derived state
  const selectedCount = taggedTransactions.filter(t => t.selected).length;
  const debitCount = taggedTransactions.filter(t => t.type === 'debit').length;
  
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(prevTransactions => prevTransactions.map(t => ({
      ...t,
      selected: checked && t.type === 'debit' // Only select debits
    })));
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    setTaggedTransactions(prevTransactions => prevTransactions.map(t => 
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
