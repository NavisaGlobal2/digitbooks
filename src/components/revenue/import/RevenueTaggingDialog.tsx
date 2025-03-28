
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ParsedTransaction } from "./parsers/types";
import TaggingDialogHeader from "./TaggingDialogHeader";
import TransactionBulkActions from "./TransactionBulkActions";
import TransactionTable from "./TransactionTable";
import TaggingDialogFooter from "./TaggingDialogFooter";
import { useTransactionTagging } from "./useTransactionTagging";

interface RevenueTaggingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transactions: ParsedTransaction[];
  onTaggingComplete: (taggedTransactions: ParsedTransaction[]) => void;
}

const RevenueTaggingDialog = ({
  open,
  onOpenChange,
  transactions,
  onTaggingComplete,
}: RevenueTaggingDialogProps) => {
  const {
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
  } = useTransactionTagging(transactions);

  const handleSave = () => {
    onTaggingComplete(taggedTransactions);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl p-0 gap-0 max-h-[90vh] overflow-hidden">
        <TaggingDialogHeader 
          selectedCount={selectedCount}
          creditCount={creditCount}
          taggedCount={taggedCount}
        />
        
        <TransactionBulkActions
          selectAll={selectAll}
          onSelectAllChange={handleSelectAll}
          onSourceForAllChange={handleSetSourceForAll}
          suggestedCount={suggestedCount}
          onApplySuggestions={handleApplyAllSuggestions}
        />
        
        <TransactionTable 
          transactions={taggedTransactions}
          onSelectTransaction={handleSelectTransaction}
          onSetSource={handleSetSource}
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

export default RevenueTaggingDialog;
