
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ParsedTransaction } from "./upload/parsers";
import TaggingDialogHeader from "./upload/TaggingDialogHeader";
import TransactionBulkActions from "./upload/TransactionBulkActions";
import TransactionTable from "./upload/TransactionTable";
import TaggingDialogFooter from "./upload/TaggingDialogFooter";
import { useTransactionTagging } from "./upload/useTransactionTagging";
import { useEffect } from "react";

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
  // Log received transactions for debugging
  useEffect(() => {
    if (open) {
      console.log(`TransactionTaggingDialog opened with ${transactions.length} transactions`);
      console.log("First few transaction IDs:", transactions.slice(0, 3).map(t => t.id).join(", "));
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
  } = useTransactionTagging(transactions);

  const handleSave = () => {
    console.log(`Saving ${taggedCount} tagged transactions`);
    onTaggingComplete(taggedTransactions);
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
