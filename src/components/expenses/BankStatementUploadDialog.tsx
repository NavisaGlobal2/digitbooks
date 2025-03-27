
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  const handleTransactionsParsed = (transactions: ParsedTransaction[]) => {
    setParsedTransactions(transactions);
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
            
            {/* Processing mode toggle */}
            <div className="flex items-center space-x-2">
              <Switch 
                id="server-processing" 
                checked={useEdgeFunction} 
                onCheckedChange={toggleEdgeFunction}
                disabled={!edgeFunctionAvailable}
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
              onParse={parseFile}
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
