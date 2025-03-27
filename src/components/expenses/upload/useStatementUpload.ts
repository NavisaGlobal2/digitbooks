
import { useState } from "react";
import { toast } from "sonner";
import { parseStatementFile, parseViaEdgeFunction, ParsedTransaction } from "./parsers";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  const [edgeFunctionAvailable, setEdgeFunctionAvailable] = useState(true);

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
      
      // Reset edge function availability when a new file is selected
      setEdgeFunctionAvailable(true);
    }
  };

  const parseFile = async () => {
    if (!file) {
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);
    setError(null);

    // PDF files can only be processed by the edge function
    const isPdf = file.name.toLowerCase().endsWith('.pdf');
    
    if (isPdf && !useEdgeFunction) {
      toast.info("PDF files require server-side processing. Switching to server mode.");
      setUseEdgeFunction(true);
    }

    // Choose between client-side parsing or edge function
    if (useEdgeFunction) {
      await parseViaEdgeFunction(
        file,
        (transactions) => {
          setUploading(false);
          onTransactionsParsed(transactions);
        },
        (errorMessage) => {
          setError(errorMessage);
          setUploading(false);
          setEdgeFunctionAvailable(false); // Mark edge function as unavailable after an error
          
          // Fallback to client-side parsing if not a PDF
          if (!isPdf) {
            toast.info("Falling back to client-side parsing");
            parseViaClient();
          }
        }
      );
    } else {
      parseViaClient();
    }
  };

  const parseViaClient = () => {
    toast.info("Processing your bank statement on the client");
    parseStatementFile(
      file!,
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

  const toggleEdgeFunction = () => {
    setUseEdgeFunction(!useEdgeFunction);
    if (!useEdgeFunction) {
      // Reset edge function availability when user manually enables it
      setEdgeFunctionAvailable(true);
    }
  };

  return {
    file,
    uploading,
    error,
    useEdgeFunction,
    setUseEdgeFunction,
    toggleEdgeFunction,
    edgeFunctionAvailable,
    handleFileChange,
    parseFile,
    clearFile
  };
};
