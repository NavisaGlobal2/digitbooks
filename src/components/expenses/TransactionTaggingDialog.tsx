
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ParsedTransaction } from "./upload/parsers";
import TaggingDialogHeader from "./upload/TaggingDialogHeader";
import TransactionBulkActions from "./upload/TransactionBulkActions";
import TransactionTable from "./upload/TransactionTable";
import TaggingDialogFooter from "./upload/TaggingDialogFooter";
import { useTransactionTagging } from "./upload/useTransactionTagging";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from 'uuid';

interface TransactionTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: ParsedTransaction[];
  onTaggingComplete: (taggedTransactions: ParsedTransaction[]) => void;
}

const TransactionTaggingDialog = ({
  open,
  onOpenChange,
  transactions,
  onTaggingComplete,
}: TransactionTaggingDialogProps) => {
  // Ensure all transactions have unique IDs
  const [processedTransactions, setProcessedTransactions] = useState<ParsedTransaction[]>([]);
  
  // Process transactions when dialog opens or transactions change
  useEffect(() => {
    if (open && transactions.length > 0) {
      console.log(`TransactionTaggingDialog processing ${transactions.length} transactions`);
      
      // Ensure all transactions have unique IDs
      const withUniqueIds = transactions.map(t => ({
        ...t,
        id: t.id || uuidv4(), // Ensure each transaction has a unique ID
        selected: false // Start with no selection
      }));
      
      console.log(`Processed ${withUniqueIds.length} transactions with unique IDs`);
      console.log(`First few transaction IDs: ${withUniqueIds.slice(0, 3).map(t => t.id).join(', ')}`);
      
      setProcessedTransactions(withUniqueIds);
    }
  }, [open, transactions]);

  const {
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
  } = useTransactionTagging(processedTransactions);

  const handleSave = () => {
    console.log(`Saving ${taggedCount} tagged transactions out of ${selectedCount} selected`);
    onTaggingComplete(taggedTransactions);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <TaggingDialogHeader 
          selectedCount={selectedCount}
          debitCount={debitCount}
          taggedCount={taggedCount}
        />
        
        <TransactionBulkActions
          selectAll={selectAll}
          onSelectAllChange={handleSelectAll}
          onCategoryForAllChange={handleSetCategoryForAll}
          selectedCount={selectedCount}
        />
        
        <TransactionTable 
          transactions={taggedTransactions}
          onSelectTransaction={handleSelectTransaction}
          onSetCategory={handleSetCategory}
        />

        <TaggingDialogFooter
          isReadyToSave={isReadyToSave}
          selectedCount={selectedCount}
          taggedCount={taggedCount}
          onCancel={() => onOpenChange(false)}
          onSave={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
};

export default TransactionTaggingDialog;
