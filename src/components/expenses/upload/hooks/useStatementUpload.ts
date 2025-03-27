
import { useState } from "react";
import { ColumnMapping } from "../parsers/columnMapper";
import { parseCSVFile } from "../parsers/csvParser";
import { ParsedTransaction } from "../parsers";
import { useUploadProgress } from "./useUploadProgress";
import { useUploadError } from "./useUploadError";
import { useFileProcessing } from "./useFileProcessing";

export const useStatementUpload = (
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void
) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  const [edgeFunctionAvailable, setEdgeFunctionAvailable] = useState(true);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping | null>(null);

  const {
    progress,
    step,
    isCancelled,
    startProgress,
    resetProgress,
    completeProgress,
    cancelProgress,
    updateProgress
  } = useUploadProgress();

  const {
    error,
    setError,
    handleError,
    clearError,
    showFallbackMessage
  } = useUploadError();

  const {
    csvParseResult,
    showColumnMapping,
    setShowColumnMapping,
    processServerSide,
    processClientSideCSV
  } = useFileProcessing({
    onTransactionsParsed,
    handleError,
    resetProgress,
    completeProgress,
    showFallbackMessage,
    isCancelled
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      clearError();
      
      // Check file type
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['csv', 'xlsx', 'xls', 'pdf'].includes(fileExt || '')) {
        setError('Unsupported file format. Please upload CSV, Excel, or PDF files only.');
        return;
      }
      
      // Check file size
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File is too large. Maximum file size is 10MB.');
        return;
      }
      
      // Reset edge function availability when a new file is selected
      setEdgeFunctionAvailable(true);
    }
  };

  const parseFile = async () => {
    if (!file) {
      showFallbackMessage("Please select a bank statement file");
      return;
    }

    setUploading(true);
    clearError();

    try {
      // Start progress simulation
      const stopProgressSimulation = startProgress();
      
      // PDF files can only be processed by the edge function
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      
      if (isPdf && !useEdgeFunction) {
        showFallbackMessage("PDF files require server-side processing. Switching to server mode.");
        setUseEdgeFunction(true);
      }

      // Always use column mapping for CSV files when client-side processing is selected
      if (isCsv && !useEdgeFunction) {
        processClientSideCSV(file);
        return;
      }

      // For non-CSV files or when server-side processing is enabled
      if (useEdgeFunction) {
        await processServerSide(file);
      }
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      handleError("An unexpected error occurred. Please try again.");
      setUploading(false);
    }
  };

  const handleColumnMappingComplete = (mapping: ColumnMapping) => {
    if (!csvParseResult || !file) return;
    
    setColumnMapping(mapping);
    setShowColumnMapping(false);
    setUploading(true);
    updateProgress(30, "Applying column mapping...");
    
    // Parse the CSV with the provided column mapping
    parseCSVFile(
      file,
      (result) => {
        onTransactionsParsed(result.transactions);
        setUploading(false);
        resetProgress();
      },
      (errorMessage) => {
        handleError(errorMessage);
        setUploading(false);
        resetProgress();
      },
      mapping
    );
  };

  const clearFile = () => {
    setFile(null);
    clearError();
    setUploading(false);
    resetProgress();
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
    // Progress related
    progress,
    step,
    cancelProgress,
    // Column mapping related
    showColumnMapping,
    setShowColumnMapping,
    csvParseResult,
    handleColumnMappingComplete
  };
};
