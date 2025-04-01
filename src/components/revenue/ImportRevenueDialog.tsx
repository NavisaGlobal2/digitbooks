import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, FileText } from "lucide-react";
import { Revenue } from "@/types/revenue";
import { toast } from "sonner";
import { parseStatementFile } from "./import/parsers";
import { ParsedTransaction } from "./import/parsers/types";
import RevenueTaggingDialog from "./import/RevenueTaggingDialog";

interface ImportRevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRevenuesImported?: (revenues: Omit<Revenue, "id">[]) => void;
}

const ImportRevenueDialog = ({ open, onOpenChange, onRevenuesImported }: ImportRevenueDialogProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedTransactions, setParsedTransactions] = useState<ParsedTransaction[]>([]);
  const [showTaggingDialog, setShowTaggingDialog] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleBrowseClick = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a file to import");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      // Set a timeout to abort if processing takes too long
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Processing timeout - file may be too large")), 30000);
      });

      const processPromise = new Promise<void>((resolve, reject) => {
        parseStatementFile(
          file,
          (transactions) => {
            console.log(`Successfully parsed ${Array.isArray(transactions) ? transactions.length : 0} transactions`);
            if (Array.isArray(transactions)) {
              setParsedTransactions(transactions);
              setShowTaggingDialog(true);
              resolve();
            } else {
              console.log("Received CSVParseResult object instead of transactions array");
              if (transactions && 'transactions' in transactions) {
                setParsedTransactions(transactions.transactions);
                setShowTaggingDialog(true);
                resolve();
              } else {
                reject("Unsupported file format. Please use a bank statement file.");
              }
            }
          },
          (errorMessage) => {
            console.error("Error parsing file:", errorMessage);
            reject(errorMessage);
            return true;
          }
        );
      });

      await Promise.race([processPromise, timeoutPromise]);
      setIsUploading(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setError(typeof error === 'string' ? error : "Failed to process file. The file may be too large or in an unsupported format.");
      setIsUploading(false);
      toast.error("File processing failed. Please try a smaller file or different format.");
    }
  };

  const handleTaggingComplete = (taggedTransactions: ParsedTransaction[]) => {
    const selectedTransactions = taggedTransactions.filter(tx => tx.selected && tx.source);
    
    if (selectedTransactions.length === 0) {
      toast.warning("No transactions were selected for import");
      return;
    }
    
    try {
      // Prepare revenue entries from the selected transactions
      const revenues: Omit<Revenue, "id">[] = selectedTransactions.map(tx => ({
        description: tx.description,
        amount: tx.amount,
        date: new Date(tx.date),
        source: tx.source || "other",
        payment_method: "bank transfer",
        payment_status: "paid",
        status: "paid", // Make sure the status field is included
        revenue_number: `REV-${Math.floor(Math.random() * 10000)}`,
        notes: `Imported from bank statement: ${file?.name || "unknown"}`
        // Remove client_name as it doesn't exist in the database schema
      }));
      
      if (onRevenuesImported) {
        // Call the callback to save the revenues in the parent component
        console.log("Importing revenues:", revenues);
        onRevenuesImported(revenues);
      } else {
        console.error("onRevenuesImported callback not provided");
        toast.error("Failed to import revenues: configuration error");
      }
      
      setShowTaggingDialog(false);
      onOpenChange(false);
      
      setFile(null);
      setParsedTransactions([]);
      setError(null);
    } catch (err) {
      console.error("Error during revenue import:", err);
      toast.error("Failed to import revenues. Please try again.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Import Revenue</DialogTitle>
          </DialogHeader>
          
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-8 text-center ${
              isDragging ? 'border-green-500 bg-green-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop your CSV file here, or click to browse
            </p>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileChange}
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={handleBrowseClick}
              className="mt-4"
            >
              Browse Files
            </Button>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-500" />
                <span className="text-sm font-medium">{file.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFile(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="mt-4 text-sm text-gray-500">
            <p>File format requirements:</p>
            <ul className="list-disc list-inside mt-2">
              <li>CSV or Excel format</li>
              <li>Contains transaction data with dates and amounts</li>
              <li>First row should be column headers</li>
              <li>For larger files, consider splitting into smaller batches</li>
            </ul>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || isUploading}
            >
              {isUploading ? "Processing..." : "Import"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showTaggingDialog && (
        <RevenueTaggingDialog
          open={showTaggingDialog}
          onOpenChange={setShowTaggingDialog}
          transactions={parsedTransactions}
          onTaggingComplete={handleTaggingComplete}
          fileName={file?.name || "Unknown file"}
        />
      )}
    </>
  );
};

export default ImportRevenueDialog;
