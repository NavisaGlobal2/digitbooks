
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useExpenses } from "@/contexts/ExpenseContext";
import TransactionTaggingDialog from "./TransactionTaggingDialog";
import FileUploadArea from "./upload/FileUploadArea";
import ErrorDisplay from "./upload/ErrorDisplay";
import DialogHeader from "./upload/DialogHeader";
import UploadDialogFooter from "./upload/UploadDialogFooter";
import { useStatementUpload } from "./upload/useStatementUpload";
import { 
  ParsedTransaction
} from "./upload/statementParsers";
import { 
  saveTransactionsToDatabase,
  prepareExpensesFromTransactions 
} from "./upload/transactionStorage";

interface BankStatementUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatementProcessed: () => void;
}

const BankStatementUploadDialog = ({
  open,
  onOpenChange,
  onStatementProcessed
}: BankStatementUploadDialogProps) => {
  const { addExpenses } = useExpenses();
  const [showTaggingDialog, setShowTaggingDialog] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);

  const handleTransactionsParsed = (transactions: ParsedTransaction[]) => {
    setParsedTransactions(transactions);
    setShowTaggingDialog(true);
  };

  const {
    file,
    uploading,
    error,
    handleFileChange,
    parseFile,
    clearFile
  } = useStatementUpload(handleTransactionsParsed);

  const handleTaggingComplete = async (taggedTransactions: ParsedTransaction[]) => {
    // Generate a unique batch ID for this import
    const batchId = `batch-${Date.now()}`;
    
    // Save transactions to database first
    const dbSaveSuccess = await saveTransactionsToDatabase(taggedTransactions, batchId);
    
    if (!dbSaveSuccess) {
      toast.warning("There was an issue storing the bank transaction data");
    }
    
    // Prepare expenses to save
    const expensesToSave = prepareExpensesFromTransactions(
      taggedTransactions, 
      batchId, 
      file?.name || 'unknown'
    );
    
    if (expensesToSave.length === 0) {
      toast.warning("No expenses to save. Please tag at least one transaction.");
      return;
    }
    
    // Save the expenses
    addExpenses(expensesToSave);
    toast.success(`${expensesToSave.length} expenses imported successfully!`);
    
    // Reset state
    clearFile();
    setParsedTransactions([]);
    setShowTaggingDialog(false);
    onOpenChange(false);
    onStatementProcessed();
  };

  const closeTaggingDialog = () => {
    setShowTaggingDialog(false);
  };

  const handleClose = () => {
    clearFile();
    setParsedTransactions([]);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader title="Upload Bank Statement" />
          
          <div className="space-y-4 p-4 pt-2">
            <ErrorDisplay error={error} />
            
            <FileUploadArea 
              file={file} 
              onFileChange={handleFileChange} 
            />
            
            <UploadDialogFooter
              onCancel={handleClose}
              onParse={parseFile}
              uploading={uploading}
              disabled={!file}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Tagging Dialog */}
      {showTaggingDialog && (
        <TransactionTaggingDialog
          open={showTaggingDialog}
          onOpenChange={closeTaggingDialog}
          transactions={parsedTransactions}
          onTaggingComplete={handleTaggingComplete}
        />
      )}
    </>
  );
};

export default BankStatementUploadDialog;
