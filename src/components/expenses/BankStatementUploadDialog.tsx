
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress"; 
import { useExpenses } from "@/contexts/ExpenseContext";
import TransactionTaggingDialog from "./TransactionTaggingDialog";
import FileUploadArea from "./upload/FileUploadArea";
import ErrorDisplay from "./upload/ErrorDisplay";
import DialogHeader from "./upload/DialogHeader";
import UploadDialogFooter from "./upload/UploadDialogFooter";
import ColumnMappingDialog from "./upload/columnMapping/ColumnMappingDialog";
import { useStatementUpload } from "./upload/useStatementUpload";
import { 
  ParsedTransaction
} from "./upload/parsers";
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
  const [processingProgress, setProcessingProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState<string>("");

  const handleTransactionsParsed = (transactions: ParsedTransaction[]) => {
    setParsedTransactions(transactions);
    setProcessingProgress(100);
    setProcessingStep("");
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
    // Column mapping related
    showColumnMapping,
    setShowColumnMapping,
    csvParseResult,
    handleColumnMappingComplete
  } = useStatementUpload(handleTransactionsParsed);

  const simulateProgressForLongOperation = () => {
    // Simulate progress for long-running operations
    setProcessingProgress(0);
    setProcessingStep("Preparing file...");
    
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        // Increment progress, but never reach 100% until the actual process completes
        if (prev < 90) {
          // Update the processing step based on progress
          if (prev === 15) setProcessingStep("Uploading file...");
          if (prev === 35) setProcessingStep("Parsing transactions...");
          if (prev === 60) setProcessingStep("Processing data...");
          if (prev === 80) setProcessingStep("Finalizing...");
          
          return prev + 5;
        }
        return prev;
      });
    }, 800);
    
    // Clear the interval when component unmounts or parsing completes
    return () => clearInterval(interval);
  };

  const handleParseFile = () => {
    const stopProgressSimulation = simulateProgressForLongOperation();
    parseFile().finally(() => {
      stopProgressSimulation();
      // If process completed without showing tagging dialog, reset progress
      if (!showTaggingDialog) {
        setProcessingProgress(0);
        setProcessingStep("");
      }
    });
  };

  const handleTaggingComplete = async (taggedTransactions: ParsedTransaction[]) => {
    // Reset progress for the save operation
    setProcessingProgress(10);
    setProcessingStep("Saving transactions...");
    
    // Generate a unique batch ID for this import
    const batchId = `batch-${Date.now()}`;
    
    // Save transactions to database first
    const dbSaveSuccess = await saveTransactionsToDatabase(taggedTransactions, batchId);
    setProcessingProgress(50);
    setProcessingStep("Preparing expenses...");
    
    if (!dbSaveSuccess) {
      toast.warning("There was an issue storing the bank transaction data");
    }
    
    // Prepare expenses to save
    const expensesToSave = prepareExpensesFromTransactions(
      taggedTransactions, 
      batchId, 
      file?.name || 'unknown'
    );
    
    setProcessingProgress(75);
    setProcessingStep("Adding expenses...");
    
    if (expensesToSave.length === 0) {
      toast.warning("No expenses to save. Please tag at least one transaction.");
      setProcessingProgress(0);
      setProcessingStep("");
      return;
    }
    
    // Save the expenses
    addExpenses(expensesToSave);
    setProcessingProgress(100);
    setProcessingStep("Complete!");
    
    toast.success(`${expensesToSave.length} expenses imported successfully!`);
    
    // Reset state after a brief delay to show completion
    setTimeout(() => {
      clearFile();
      setParsedTransactions([]);
      setShowTaggingDialog(false);
      setProcessingProgress(0);
      setProcessingStep("");
      onOpenChange(false);
      onStatementProcessed();
    }, 1000);
  };

  const closeTaggingDialog = () => {
    setShowTaggingDialog(false);
    setProcessingProgress(0);
    setProcessingStep("");
  };

  const handleClose = () => {
    clearFile();
    setParsedTransactions([]);
    setProcessingProgress(0);
    setProcessingStep("");
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
            
            {/* Processing mode toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="server-processing" 
                checked={useEdgeFunction} 
                onCheckedChange={toggleEdgeFunction}
                disabled={!edgeFunctionAvailable || uploading}
              />
              <Label htmlFor="server-processing" className="flex flex-col">
                <span>
                  {useEdgeFunction ? "Server-side processing" : "Client-side processing with column mapping"}
                  {!edgeFunctionAvailable && " (server unavailable)"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {useEdgeFunction 
                    ? "Processes your statement on the server for better accuracy" 
                    : "Process and customize column mapping in the browser"}
                </span>
              </Label>
            </div>
            
            {/* Progress indicator */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{processingStep}</span>
                  <span>{processingProgress}%</span>
                </div>
                <Progress value={processingProgress} className="h-2" />
              </div>
            )}
            
            <div className="text-xs text-muted-foreground mt-2">
              <p>Supported formats:</p>
              <ul className="list-disc list-inside ml-2">
                <li>CSV files from most Nigerian banks</li>
                <li>Excel files (.xlsx, .xls) with transaction data</li>
                <li>Files should include date, description, and amount columns</li>
              </ul>
            </div>
            
            <UploadDialogFooter
              onCancel={handleClose}
              onParse={handleParseFile}
              uploading={uploading}
              disabled={!file}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      {showColumnMapping && csvParseResult && (
        <ColumnMappingDialog
          open={showColumnMapping}
          onOpenChange={setShowColumnMapping}
          headers={csvParseResult.headers}
          sampleData={csvParseResult.rows.slice(csvParseResult.hasHeader ? 1 : 0)}
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
