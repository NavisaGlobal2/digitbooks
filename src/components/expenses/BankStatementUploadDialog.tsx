
import { useState } from "react";
import { toast } from "sonner";
import { Upload, AlertCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useExpenses } from "@/contexts/ExpenseContext";
import { ExpenseCategory } from "@/types/expense";
import TransactionTaggingDialog from "./TransactionTaggingDialog";

interface BankStatementUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatementProcessed: () => void;
}

type ParsedTransaction = {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category?: ExpenseCategory;
  selected: boolean;
};

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
    
    // Parse CSV file (in a real implementation, we'd have different parsers for different file types)
    if (file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const contents = e.target?.result as string;
          const lines = contents.split('\n');
          
          // Skip header row and parse each line
          const transactions: ParsedTransaction[] = [];
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const columns = line.split(',');
            if (columns.length < 3) continue;
            
            // For this example, assuming CSV format: date, description, amount
            const date = new Date(columns[0]);
            const description = columns[1].replace(/"/g, '');
            const amount = Math.abs(parseFloat(columns[2].replace(/"/g, '')));
            
            // Determine if credit or debit
            const type = parseFloat(columns[2]) < 0 ? 'debit' : 'credit';
            
            transactions.push({
              id: `trans-${i}`,
              date,
              description,
              amount,
              type,
              selected: type === 'debit', // Auto-select debit transactions
            });
          }
          
          setParsedTransactions(transactions);
          setUploading(false);
          
          if (transactions.length === 0) {
            setError('No valid transactions found in the file');
          } else {
            setShowTaggingDialog(true);
          }
        } catch (err) {
          console.error('Error parsing CSV:', err);
          setError('Failed to parse the file. Please check the format and try again.');
          setUploading(false);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read the file');
        setUploading(false);
      };
      
      reader.readAsText(file);
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      // Mock Excel parsing for this example
      // In a real app, use a library like xlsx or exceljs
      setTimeout(() => {
        // Generate mock data for demonstration
        const transactions: ParsedTransaction[] = [];
        const now = new Date();
        
        for (let i = 0; i < 10; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          
          const amount = Math.round(Math.random() * 10000) / 100;
          const type = i % 3 === 0 ? 'credit' : 'debit';
          
          transactions.push({
            id: `trans-${i}`,
            date,
            description: `Transaction #${i+1} from Excel`,
            amount,
            type,
            selected: type === 'debit', // Auto-select debit transactions
          });
        }
        
        setParsedTransactions(transactions);
        setUploading(false);
        setShowTaggingDialog(true);
      }, 1000);
    } else if (file.name.endsWith('.pdf')) {
      // Mock PDF parsing for this example
      // In a real app, use a PDF parsing library or service
      setTimeout(() => {
        // Generate mock data for demonstration
        const transactions: ParsedTransaction[] = [];
        const now = new Date();
        
        for (let i = 0; i < 8; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i - 5);
          
          const amount = Math.round(Math.random() * 20000) / 100;
          const type = i % 4 === 0 ? 'credit' : 'debit';
          
          transactions.push({
            id: `trans-${i}`,
            date,
            description: `PDF Statement Item #${i+1}`,
            amount,
            type,
            selected: type === 'debit', // Auto-select debit transactions
          });
        }
        
        setParsedTransactions(transactions);
        setUploading(false);
        setShowTaggingDialog(true);
      }, 1500);
    } else {
      setError('Unsupported file format');
      setUploading(false);
    }
  };

  const handleTaggingComplete = (taggedTransactions: ParsedTransaction[]) => {
    // Filter only the selected transactions that have been categorized
    const expensesToSave = taggedTransactions
      .filter(t => t.selected && t.category) 
      .map(transaction => ({
        description: transaction.description,
        amount: transaction.amount,
        date: transaction.date,
        category: transaction.category as ExpenseCategory,
        status: "pending" as const,
        paymentMethod: "bank transfer" as const,
        vendor: "Bank Statement Import",
        notes: `Imported from bank statement: ${file?.name}`,
        fromStatement: true,
        batchId: `batch-${Date.now()}`  // Add batch ID for tracking
      }));
    
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
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}
            
            <div>
              <Label htmlFor="bank-statement" className="mb-2 block">
                Select statement file
              </Label>
              <div className="mt-1">
                <label className="block w-full">
                  <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
                    {file ? (
                      <div className="text-center">
                        <p className="text-sm text-gray-600">{file.name}</p>
                        <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Drop your bank statement here or click to browse
                        </span>
                        <span className="text-xs text-gray-400">
                          Supports CSV, Excel, PDF
                        </span>
                      </div>
                    )}
                    <input
                      id="bank-statement"
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                </label>
              </div>
            </div>
            
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
