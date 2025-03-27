
import { useState } from "react";
import { toast } from "sonner";
import { parseViaEdgeFunction, ParsedTransaction } from "./parsers";
import { parseCSVFile, CSVParseResult } from "./parsers/csvParser";
import { ColumnMapping } from "./parsers/columnMapper";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  const [edgeFunctionAvailable, setEdgeFunctionAvailable] = useState(true);
  
  // New state for column mapping
  const [showColumnMapping, setShowColumnMapping] = useState(false);
  const [csvParseResult, setCsvParseResult] = useState<CSVParseResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError(null);
      setCsvParseResult(null);
      setColumnMapping(null);
      
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
    const isCsv = file.name.toLowerCase().endsWith('.csv');
    
    if (isPdf && !useEdgeFunction) {
      toast.info("PDF files require server-side processing. Switching to server mode.");
      setUseEdgeFunction(true);
    }

    // For CSV files, we offer column mapping
    if (isCsv && !useEdgeFunction) {
      parseCSVFile(
        file,
        (result) => {
          setCsvParseResult(result);
          setShowColumnMapping(true);
          setUploading(false);
        },
        (errorMessage) => {
          setError(errorMessage);
          setUploading(false);
        }
      );
      return;
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
    
    // Use existing parser functions here
    // For now we're focusing on the CSV mapping feature
    setUploading(false);
    setError("Client side parsing without column mapping is not supported in this version. Please use column mapping for CSV files or server-side processing.");
  };

  const handleColumnMappingComplete = (mapping: ColumnMapping) => {
    if (!csvParseResult) return;
    
    setColumnMapping(mapping);
    setShowColumnMapping(false);
    
    // Parse the CSV with the provided column mapping
    parseCSVFile(
      file!,
      (result) => {
        onTransactionsParsed(result.transactions);
      },
      (errorMessage) => {
        setError(errorMessage);
      },
      mapping
    );
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setCsvParseResult(null);
    setColumnMapping(null);
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
    clearFile,
    // Column mapping related
    showColumnMapping,
    setShowColumnMapping,
    csvParseResult,
    handleColumnMappingComplete
  };
};
