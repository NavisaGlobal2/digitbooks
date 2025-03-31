
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
      // Process the file using the parseStatementFile function
      parseStatementFile(
        file,
        (transactions) => {
          // Handle successful parsing
          console.log(`Successfully parsed ${Array.isArray(transactions) ? transactions.length : 0} transactions`);
          if (Array.isArray(transactions)) {
            setParsedTransactions(transactions);
            setShowTaggingDialog(true);
          } else {
            // This handles the CSVParseResult case if needed
            console.log("Received CSVParseResult object instead of transactions array");
            setError("Unsupported file format. Please use a bank statement file.");
          }
          setIsUploading(false);
        },
        (errorMessage) => {
          console.error("Error parsing file:", errorMessage);
          setError(errorMessage);
          setIsUploading(false);
          return true; // Return true to indicate error was handled
        }
      );
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process file. Please check the format and try again.");
      setIsUploading(false);
    }
  };

  const handleTaggingComplete = (taggedTransactions: ParsedTransaction[]) => {
    // Convert tagged transactions to Revenue objects
    const selectedTransactions = taggedTransactions.filter(tx => tx.selected);
    
    if (selectedTransactions.length === 0) {
      toast.warning("No transactions were selected for import");
      return;
    }
    
    const revenues: Omit<Revenue, "id">[] = selectedTransactions.map(tx => ({
      description: tx.description,
      amount: tx.amount,
      date: new Date(tx.date),
      source: tx.source || "other",
      paymentMethod: "bank transfer",
      notes: `Imported from bank statement: ${file?.name || "unknown"}`,
      paymentStatus: "paid"
    }));
    
    if (onRevenuesImported) {
      onRevenuesImported(revenues);
    }
    
    setShowTaggingDialog(false);
    onOpenChange(false);
    
    // Reset state for next import
    setFile(null);
    setParsedTransactions([]);
    setError(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => {
        if (!isUploading) {
          onOpenChange(isOpen);
        }
      }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Import revenue</DialogTitle>
            <button 
              onClick={() => !isUploading && onOpenChange(false)} 
              className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
              aria-label="Close"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>
          
          <div className="py-4">
            <div 
              className={`border-2 border-dashed rounded-md p-8 ${isDragging ? 'border-green-500 bg-green-50' : error ? 'border-red-200' : 'border-gray-200'} flex flex-col items-center justify-center text-center cursor-pointer`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <FileText className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 mb-1">Drag & drop bank statement here</p>
              <p className="text-gray-500 text-sm mb-2">Or</p>
              <button 
                type="button" 
                className="text-green-500 font-medium text-sm hover:text-green-600 focus:outline-none"
                disabled={isUploading}
              >
                Browse files
              </button>
              <input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <p className="text-xs text-gray-400 mt-3">Supported formats: CSV, Excel, PDF</p>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {file && !error && (
              <div className="mt-4 p-2 bg-gray-50 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  <span className="text-sm font-medium truncate">{file.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between gap-3 mt-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!file || isUploading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              {isUploading ? "Processing..." : "Upload"}
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
        />
      )}
    </>
  );
};

export default ImportRevenueDialog;
