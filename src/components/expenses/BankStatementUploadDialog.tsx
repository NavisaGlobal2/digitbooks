
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useExpenses } from "@/contexts/ExpenseContext";
import TransactionTaggingDialog from "./TransactionTaggingDialog";
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
import { v4 as uuidv4 } from "uuid";

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
    console.log(`Received ${transactions.length} parsed transactions`);
    
    // Pre-select all debit transactions by default
    const preSelectedTransactions = transactions.map(tx => ({
      ...tx,
      selected: tx.type === 'debit' // Automatically select debit transactions
    }));
    
    setParsedTransactions(preSelectedTransactions);
    setProcessingComplete(true);
    setShowTaggingDialog(true);
  };

  const {
    file,
    uploading,
    error,
    handleFileChange,
    parseFile,
    clearFile,
    progress,
    step,
    isWaitingForServer,
    cancelProgress,
    isAuthenticated,
    preferredAIProvider,
    setPreferredAIProvider,
    useVisionApi,
    setUseVisionApi
  } = useStatementUpload({ handleTransactionsParsed });

  const handleTaggingComplete = async (taggedTransactions: ParsedTransaction[]) => {
    // Generate a unique batch ID using UUID for this import
    const batchId = uuidv4();
    
    try {
      const selectedCount = taggedTransactions.filter(tx => tx.selected).length;
      console.log(`Processing ${selectedCount} selected transactions out of ${taggedTransactions.length} tagged transactions with batch ID: ${batchId}`);
      
      if (selectedCount === 0) {
        toast.warning("No transactions selected. Please select at least one transaction.");
        return;
      }
      
      // Save transactions to database first
      const dbSaveSuccess = await saveTransactionsToDatabase(taggedTransactions, batchId);
      
      if (!dbSaveSuccess) {
        toast.error("Failed to save bank transaction data. Please try again.");
        return;
      }
      
      // Prepare expenses to save
      const expensesToSave = prepareExpensesFromTransactions(
        taggedTransactions, 
        batchId, 
        file?.name || 'unknown'
      );
      
      if (expensesToSave.length === 0) {
        toast.warning("No expenses to save. Please tag at least one transaction as an expense category.");
        return;
      }
      
      console.log(`Saving ${expensesToSave.length} expenses to the expense tracker`);
      
      // Save the expenses
      await addExpenses(expensesToSave);
      
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
            handleFileChange={handleFileChange}
            parseFile={parseFile}
            onClose={handleClose}
            progress={progress}
            step={step}
            isAuthenticated={isAuthenticated}
            preferredAIProvider={preferredAIProvider}
            setPreferredAIProvider={setPreferredAIProvider}
            isWaitingForServer={isWaitingForServer}
            useVisionApi={useVisionApi}
            setUseVisionApi={setUseVisionApi}
          />
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
