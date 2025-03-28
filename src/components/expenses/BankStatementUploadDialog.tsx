
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useExpenses } from "@/contexts/ExpenseContext";
import TransactionTaggingDialog from "./TransactionTaggingDialog";
import ColumnMappingDialog from "./upload/columnMapping/ColumnMappingDialog";
import { useStatementUpload } from "./upload/hooks/useStatementUpload";
import { 
  ParsedTransaction
} from "./upload/parsers";
import { 
  saveTransactionsToDatabase,
  prepareExpensesFromTransactions 
} from "./upload/transactionStorage";
import UploadDialogContent from "./upload/components/UploadDialogContent";
import { toast } from "sonner";

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
  const [processingComplete, setProcessingComplete] = useState(false);
  
  const handleTransactionsParsed = (transactions: ParsedTransaction[]) => {
    setParsedTransactions(transactions);
    setProcessingComplete(true);
    setShowTaggingDialog(true);
  };

  const {
    file,
    uploading,
    error,
    useEdgeFunction,
    toggleEdgeFunction,
    edgeFunctionAvailable,
    handleFileChange,
    parseFile,
    clearFile,
    progress,
    step,
    cancelProgress,
    // Column mapping related
    showColumnMapping,
    setShowColumnMapping,
    csvParseResult,
    handleColumnMappingComplete
  } = useStatementUpload(handleTransactionsParsed);

  const handleTaggingComplete = async (taggedTransactions: ParsedTransaction[]) => {
    // Generate a unique batch ID for this import
    const batchId = `batch-${Date.now()}`;
    
    try {
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
      setProcessingComplete(false);
      onOpenChange(false);
      onStatementProcessed();
    } catch (error) {
      console.error("Error saving expenses:", error);
      toast.error("Failed to save expenses. Please try again.");
    }
  };

  const closeTaggingDialog = () => {
    setShowTaggingDialog(false);
  };

  const handleClose = () => {
    if (uploading) {
      cancelProgress();
    } else {
      clearFile();
      setParsedTransactions([]);
      setProcessingComplete(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <UploadDialogContent
            file={file}
            uploading={uploading}
            error={error}
            useEdgeFunction={useEdgeFunction}
            toggleEdgeFunction={toggleEdgeFunction}
            edgeFunctionAvailable={edgeFunctionAvailable}
            handleFileChange={handleFileChange}
            parseFile={parseFile}
            onClose={handleClose}
            progress={progress}
            step={step}
          />
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      {showColumnMapping && csvParseResult && (
        <ColumnMappingDialog
          open={showColumnMapping}
          onOpenChange={setShowColumnMapping}
          headers={csvParseResult.headers}
          sampleData={csvParseResult.rows.slice(csvParseResult.hasHeader ? 1 : 0, csvParseResult.hasHeader ? 6 : 5)}
          onMappingComplete={handleColumnMappingComplete}
        />
      )}

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
