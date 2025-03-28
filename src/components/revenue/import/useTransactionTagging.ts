
import { useState, useEffect } from "react";
import { ParsedTransaction } from "./parsers/types";
import { RevenueSource } from "@/types/revenue";
import { toast } from "sonner";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(initialTransactions);
  const [selectAll, setSelectAll] = useState(true);
  
  // Initialize with all credit transactions selected
  useEffect(() => {
    setTaggedTransactions(
      initialTransactions.map(tx => ({
        ...tx,
        selected: tx.type === 'credit',
      }))
    );
  }, [initialTransactions]);
  
  // Calculate various counts for UI display
  const selectedCount = taggedTransactions.filter(tx => tx.selected).length;
  const creditCount = taggedTransactions.filter(tx => tx.type === 'credit').length;
  const taggedCount = taggedTransactions.filter(tx => tx.selected && tx.source).length;
  const suggestedCount = taggedTransactions.filter(tx => tx.sourceSuggestion && !tx.source).length;
  
  // Check if ready to save (all selected transactions must have a source)
  const isReadyToSave = selectedCount > 0 && 
    taggedTransactions.every(tx => !tx.selected || tx.source);
  
  // Handle select all toggle
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setTaggedTransactions(
      taggedTransactions.map(tx => ({
        ...tx,
        // Only allow selecting credit transactions
        selected: tx.type === 'credit' ? checked : false,
      }))
    );
  };
  
  // Handle selection of individual transactions
  const handleSelectTransaction = (id: string, checked: boolean) => {
    setTaggedTransactions(
      taggedTransactions.map(tx => 
        tx.id === id ? { ...tx, selected: checked } : tx
      )
    );
    
    // Update selectAll state based on whether all credit transactions are selected
    const updatedTransactions = taggedTransactions.map(tx => 
      tx.id === id ? { ...tx, selected: checked } : tx
    );
    
    const allCreditSelected = updatedTransactions.every(
      tx => tx.type !== 'credit' || tx.selected
    );
    
    setSelectAll(allCreditSelected);
  };
  
  // Handle setting source for a transaction
  const handleSetSource = (id: string, source: RevenueSource) => {
    setTaggedTransactions(
      taggedTransactions.map(tx => 
        tx.id === id ? { ...tx, source } : tx
      )
    );
  };
  
  // Apply a source to all selected transactions
  const handleSetSourceForAll = (source: RevenueSource) => {
    if (selectedCount === 0) {
      toast.warning("No transactions selected");
      return;
    }
    
    setTaggedTransactions(
      taggedTransactions.map(tx => 
        tx.selected ? { ...tx, source } : tx
      )
    );
    
    toast.success(`Applied source "${source}" to ${selectedCount} transaction(s)`);
  };
  
  // Apply all AI suggestions
  const handleApplyAllSuggestions = () => {
    if (suggestedCount === 0) {
      toast.info("No source suggestions available");
      return;
    }
    
    let appliedCount = 0;
    
    setTaggedTransactions(
      taggedTransactions.map(tx => {
        if (tx.selected && tx.sourceSuggestion && !tx.source) {
          appliedCount++;
          return {
            ...tx,
            source: tx.sourceSuggestion.source,
          };
        }
        return tx;
      })
    );
    
    if (appliedCount > 0) {
      toast.success(`Applied ${appliedCount} suggested source(s)`);
    } else {
      toast.info("No new suggestions applied");
    }
  };
  
  return {
    taggedTransactions,
    selectAll,
    isReadyToSave,
    selectedCount,
    creditCount,
    taggedCount,
    suggestedCount,
    handleSelectAll,
    handleSelectTransaction,
    handleSetSource,
    handleSetSourceForAll,
    handleApplyAllSuggestions
  };
};
