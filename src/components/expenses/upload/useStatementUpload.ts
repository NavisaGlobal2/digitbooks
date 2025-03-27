
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
  
  // Column mapping related state
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
      toast.error("Please select a bank statement file");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // PDF files can only be processed by the edge function
      const isPdf = file.name.toLowerCase().endsWith('.pdf');
      const isCsv = file.name.toLowerCase().endsWith('.csv');
      
      if (isPdf && !useEdgeFunction) {
        toast.info("PDF files require server-side processing. Switching to server mode.");
        setUseEdgeFunction(true);
      }

      // Always use column mapping for CSV files when client-side processing is selected
      if (isCsv && !useEdgeFunction) {
        try {
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
        } catch (error) {
          console.error("CSV parsing error:", error);
          setError("Failed to parse CSV file. Please check the file format.");
          setUploading(false);
        }
        return;
      }

      // For non-CSV files or when server-side processing is enabled
      if (useEdgeFunction) {
        // Set a timeout for edge function calls
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Server processing timed out after 45 seconds")), 45000);
        });
        
        try {
          // Race the edge function call against the timeout
          await Promise.race([
            parseViaEdgeFunction(
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
                  if (isCsv) {
                    // For CSV files, always use column mapping
                    parseCSVFile(
                      file,
                      (result) => {
                        setCsvParseResult(result);
                        setShowColumnMapping(true);
                      },
                      (innerError) => {
                        setError(innerError);
                      }
                    );
                  } else {
                    // For Excel files
                    setError("Client-side Excel parsing is not fully implemented yet. Please try CSV format.");
                  }
                }
              }
            ),
            timeoutPromise
          ]);
        } catch (error) {
          console.error("Edge function timeout or error:", error);
          setError("Server processing timed out. Please try client-side processing or a smaller file.");
          setUploading(false);
          setEdgeFunctionAvailable(false);
          
          // Fallback to client-side parsing if not a PDF
          if (!isPdf && isCsv) {
            toast.info("Falling back to client-side parsing due to timeout");
            parseCSVFile(
              file,
              (result) => {
                setCsvParseResult(result);
                setShowColumnMapping(true);
              },
              (innerError) => {
                setError(innerError);
              }
            );
          }
        }
      }
    } catch (error) {
      console.error("Unexpected error in parseFile:", error);
      setError("An unexpected error occurred. Please try again.");
      setUploading(false);
    }
  };

  const handleColumnMappingComplete = (mapping: ColumnMapping) => {
    if (!csvParseResult) return;
    
    setColumnMapping(mapping);
    setShowColumnMapping(false);
    setUploading(true);
    
    // Parse the CSV with the provided column mapping
    parseCSVFile(
      file!,
      (result) => {
        onTransactionsParsed(result.transactions);
        setUploading(false);
      },
      (errorMessage) => {
        setError(errorMessage);
        setUploading(false);
      },
      mapping
    );
  };

  const clearFile = () => {
    setFile(null);
    setError(null);
    setCsvParseResult(null);
    setColumnMapping(null);
    setUploading(false);
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
