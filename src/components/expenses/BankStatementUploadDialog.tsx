import { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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
  const [useAIFormatting, setUseAIFormatting] = useState(true);
  const [processingStats, setProcessingStats] = useState<{
    total: number;
    credits: number;
    debits: number;
    message: string;
  } | null>(null);
  
  const handleTransactionsParsed = (transactions: ParsedTransaction[], metadata?: any) => {
    console.log(`Received ${transactions.length} parsed transactions`);
    
    if (!transactions || transactions.length === 0) {
      toast.error("No valid transactions found in the file");
      return;
    }
    
    try {
      // Convert amounts to numbers if they're strings
      const validatedTransactions = transactions.map(tx => ({
        ...tx,
        amount: typeof tx.amount === 'number' ? tx.amount : parseFloat(String(tx.amount).replace(/[^\d.-]/g, '')),
        selected: tx.selected !== undefined ? tx.selected : (tx.type === 'debit')
      }));
      
      // Filter out any transactions with invalid amounts (NaN)
      const filteredTransactions = validatedTransactions.filter(tx => !isNaN(tx.amount));
      
      if (filteredTransactions.length === 0) {
        toast.error("No valid transactions found after filtering");
        return;
      }
      
      // Calculate some stats
      const debits = filteredTransactions.filter(tx => tx.type === 'debit').length;
      const credits = filteredTransactions.filter(tx => tx.type === 'credit').length;
      
      setProcessingStats({
        total: filteredTransactions.length,
        credits,
        debits,
        message: metadata?.message || `Processed ${filteredTransactions.length} transactions`
      });
      
      setParsedTransactions(filteredTransactions);
      setProcessingComplete(true);
      setShowTaggingDialog(true);
      
      console.log("Opening tagging dialog with transactions:", filteredTransactions.length);
    } catch (error) {
      console.error("Error processing transactions:", error);
      toast.error("Error processing transactions. Please try again.");
    }
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
    responseMetadata
  } = useStatementUpload(handleTransactionsParsed);

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
      setProcessingStats(null);
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
      setProcessingStats(null);
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
            useAIFormatting={useAIFormatting}
            setUseAIFormatting={setUseAIFormatting}
          />
          
          {processingStats && !showTaggingDialog && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Processing Summary</AlertTitle>
              <AlertDescription>
                <p>{processingStats.message}</p>
                <p className="text-sm mt-1">
                  Found {processingStats.total} transactions: 
                  <span className="text-green-600 font-medium ml-1">{processingStats.credits} credits</span>,
                  <span className="text-red-600 font-medium ml-1">{processingStats.debits} debits</span>
                </p>
              </AlertDescription>
            </Alert>
          )}
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
