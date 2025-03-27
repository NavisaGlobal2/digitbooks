
import { useState } from "react";
import { toast } from "sonner";
import { parseStatementFile } from "./statementParsers";
import { ParsedTransaction } from "./statementParsers";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
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
        setUploading(false);
        onTransactionsParsed(transactions);
      },
      (errorMessage) => {
        setError(errorMessage);
        setUploading(false);
      }
    );
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
  };

  return {
    file,
    uploading,
    error,
    handleFileChange,
    parseFile,
    clearFile
  };
};
