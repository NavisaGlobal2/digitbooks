
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
import { AlertCircle, AlertTriangle, CheckCircle, FileWarning } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
    filtered?: number;
    originalCount?: number;
    aiFormatting?: boolean;
  } | null>(null);
  
  const handleTransactionsParsed = (transactions: ParsedTransaction[], metadata?: any) => {
    console.log(`Received ${transactions.length} parsed transactions`);
    
    if (!transactions || transactions.length === 0) {
      toast.error("No valid transactions found in the file");
      return;
    }
    
    // Pre-select all debit transactions by default
    const preSelectedTransactions = transactions.map(tx => ({
      ...tx,
      selected: tx.type === 'debit' // Automatically select debit transactions
    }));
    
    // Calculate some stats
    const debits = transactions.filter(tx => tx.type === 'debit').length;
    const credits = transactions.filter(tx => tx.type === 'credit').length;
    
    setProcessingStats({
      total: transactions.length,
      credits,
      debits,
      message: metadata?.message || `Processed ${transactions.length} transactions`,
      filtered: metadata?.filteredCount || 0,
      originalCount: metadata?.originalCount || transactions.length,
      aiFormatting: metadata?.formattingApplied || false
    });
    
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
            <Alert className={`mt-4 ${processingStats.filtered > 0 ? 'border-amber-200 bg-amber-50' : ''}`}>
              {processingStats.filtered > 0 ? (
                <AlertTriangle className="h-4 w-4 text-amber-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertTitle className="flex items-center gap-2">
                Processing Summary 
                {processingStats.aiFormatting && (
                  <Badge variant="outline" className="text-xs bg-blue-50">AI Enhanced</Badge>
                )}
              </AlertTitle>
              <AlertDescription className="space-y-2">
                <p>{processingStats.message}</p>
                
                <div className="text-sm mt-1">
                  <p>
                    Found {processingStats.total} valid transactions: 
                    <span className="text-green-600 font-medium ml-1">{processingStats.credits} credits</span>,
                    <span className="text-red-600 font-medium ml-1">{processingStats.debits} debits</span>
                  </p>
                  
                  {processingStats.filtered > 0 && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-center gap-2">
                      <FileWarning className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <p className="text-amber-800">
                        {processingStats.filtered} invalid transactions were filtered out.
                        <br />
                        <span className="text-xs">Try enabling AI formatting or check your file format.</span>
                      </p>
                    </div>
                  )}
                </div>
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
