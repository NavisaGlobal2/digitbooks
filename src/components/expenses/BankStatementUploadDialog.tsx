
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useExpenses } from "@/contexts/ExpenseContext";
import TransactionTaggingDialog from "./TransactionTaggingDialog";
import FileUploadArea from "./upload/FileUploadArea";
import ErrorDisplay from "./upload/ErrorDisplay";
import { 
  ParsedTransaction, 
  parseStatementFile 
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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [showTaggingDialog, setShowTaggingDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      
      // Check file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
        setError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
        return;
      }
    }
  };

  const parseFile = () => {
    if (!file) {
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);
    
    parseStatementFile(
      file,
      (transactions) => {
        setParsedTransactions(transactions);
        setUploading(false);
        setShowTaggingDialog(true);
      },
      (errorMessage) => {
        setError(errorMessage);
        setUploading(false);
      }
    );
  };

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
    setFile(null);
    setParsedTransactions([]);
    setShowTaggingDialog(false);
    onOpenChange(false);
    onStatementProcessed();
  };

  const closeTaggingDialog = () => {
    setShowTaggingDialog(false);
  };

  const handleClose = () => {
    setFile(null);
    setParsedTransactions([]);
    setError(null);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle className="text-xl font-semibold mb-4">
            Upload Bank Statement
          </DialogTitle>
          
          <div className="space-y-4">
            <ErrorDisplay error={error} />
            
            <FileUploadArea 
              file={file} 
              onFileChange={handleFileChange} 
            />
            
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                onClick={parseFile} 
                disabled={!file || uploading}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                {uploading ? "Processing..." : "Parse Statement"}
              </Button>
            </div>
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
