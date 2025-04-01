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
      parseStatementFile(
        file,
        (transactions) => {
          console.log(`Successfully parsed ${Array.isArray(transactions) ? transactions.length : 0} transactions`);
          if (Array.isArray(transactions)) {
            setParsedTransactions(transactions);
            setShowTaggingDialog(true);
          } else {
            console.log("Received CSVParseResult object instead of transactions array");
            setError("Unsupported file format. Please use a bank statement file.");
          }
          setIsUploading(false);
        },
        (errorMessage) => {
          console.error("Error parsing file:", errorMessage);
          setError(errorMessage);
          setIsUploading(false);
          return true;
        }
      );
    } catch (error) {
      console.error("Error processing file:", error);
      setError("Failed to process file. Please check the format and try again.");
      setIsUploading(false);
    }
  };

  const handleTaggingComplete = (taggedTransactions: ParsedTransaction[]) => {
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
      payment_method: "bank transfer",
      payment_status: "paid",
      notes: `Imported from bank statement: ${file?.name || "unknown"}`
    }));
    
    if (onRevenuesImported) {
      onRevenuesImported(revenues);
    }
    
    setShowTaggingDialog(false);
    onOpenChange(false);
    
    setFile(null);
    setParsedTransactions([]);
    setError(null);
  };

  return (
    <></>
  );
};

export default ImportRevenueDialog;
