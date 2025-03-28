
import { useState, useCallback, useMemo } from "react";
import { ParsedTransaction } from "./parsers/types";
import { RevenueSource } from "@/types/revenue";

export const useTransactionTagging = (initialTransactions: ParsedTransaction[]) => {
  const [taggedTransactions, setTaggedTransactions] = useState<ParsedTransaction[]>(
    initialTransactions.map(tx => ({
      ...tx,
      selected: tx.type === 'credit', // Pre-select all credit transactions
    }))
  );

  const selectAll = useMemo(() => {
    const creditTransactions = taggedTransactions.filter(tx => tx.type === 'credit');
    return creditTransactions.length > 0 && 
           creditTransactions.every(tx => tx.selected);
  }, [taggedTransactions]);

  const selectedCount = useMemo(() => 
    taggedTransactions.filter(tx => tx.selected).length, 
  [taggedTransactions]);

  const creditCount = useMemo(() => 
    taggedTransactions.filter(tx => tx.type === 'credit').length, 
  [taggedTransactions]);

  const taggedCount = useMemo(() => 
    taggedTransactions.filter(tx => tx.selected && tx.source).length, 
  [taggedTransactions]);

  const suggestedCount = useMemo(() => 
    taggedTransactions.filter(tx => tx.selected && !tx.source && tx.sourceSuggestion && tx.sourceSuggestion.confidence > 0.5).length,
  [taggedTransactions]);

  const isReadyToSave = useMemo(() => 
    taggedTransactions.some(tx => tx.selected && tx.source), 
  [taggedTransactions]);

  const handleSelectAll = useCallback((checked: boolean) => {
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(tx => {
        if (tx.type === 'credit') {
          return { ...tx, selected: checked };
        }
        return tx;
      })
    );
  }, []);

  const handleSelectTransaction = useCallback((id: string, checked: boolean) => {
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(tx => {
        if (tx.id === id) {
          return { ...tx, selected: checked };
        }
        return tx;
      })
    );
  }, []);

  const handleSetSource = useCallback((id: string, source: RevenueSource) => {
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(tx => {
        if (tx.id === id) {
          return { ...tx, source };
        }
        return tx;
      })
    );
  }, []);

  const handleSetSourceForAll = useCallback((source: RevenueSource) => {
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(tx => {
        if (tx.selected) {
          return { ...tx, source };
        }
        return tx;
      })
    );
  }, []);

  const handleApplyAllSuggestions = useCallback(() => {
    setTaggedTransactions(prevTransactions => 
      prevTransactions.map(tx => {
        if (tx.selected && !tx.source && tx.sourceSuggestion && tx.sourceSuggestion.confidence > 0.5) {
          return { ...tx, source: tx.sourceSuggestion.source };
        }
        return tx;
      })
    );
  }, []);

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
