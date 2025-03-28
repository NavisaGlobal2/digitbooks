
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ParsedTransaction } from "./upload/parsers/types";
import TaggingDialogHeader from "./upload/TaggingDialogHeader";
import TransactionBulkActions from "./upload/TransactionBulkActions";
import TransactionTable from "./upload/TransactionTable";
import TaggingDialogFooter from "./upload/TaggingDialogFooter";
import { useTransactionTagging } from "./upload/useTransactionTagging";

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
