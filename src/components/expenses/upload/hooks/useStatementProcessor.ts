import { useState, useCallback } from "react";
import { parsePDFFile } from "../parsers/pdfParser";
import { parseStatementFile, ParsedTransaction } from "../parsers";
import { useProcessingState } from "./useProcessingState";
import { processPdfAsImages, processPdfWithOcrSpace } from "../parsers/edgeFunctionParser";

interface StatementProcessorProps {
  onTransactionsParsed: (transactions: ParsedTransaction[]) => void;
  onError: (errorMessage: string) => boolean;
  startProgress: (steps?: number) => void;
  resetProgress: () => void;
  completeProgress: () => void;
  isCancelled: boolean;
  setIsWaitingForServer?: (isWaiting: boolean) => void;
  startProcessing: () => void;
  stopProcessing: () => void;
  storePdfInSupabase?: boolean;
  extractPdfText?: boolean;
  setIsProcessingPdf?: (isProcessing: boolean) => void;
  useOcrSpace?: boolean;
}

export const useStatementProcessor = ({
  onTransactionsParsed,
  onError,
  startProgress,
  resetProgress,
  completeProgress,
  isCancelled,
  setIsWaitingForServer,
  startProcessing,
  stopProcessing,
  storePdfInSupabase = false,
  extractPdfText = false,
  setIsProcessingPdf,
  useOcrSpace = false
}: StatementProcessorProps) => {
  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  
  const processStatement = useCallback(async (
    file: File, 
    preferredAIProvider: string, 
    isAuthenticated: boolean,
    useVisionApi: boolean = true
  ) => {
    startProcessing();
    startProgress();
    
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      setProcessingStatus(`Processing ${fileExt === 'pdf' ? 'PDF' : fileExt} file...`);
      
      // Process PDFs based on selected extraction method
      if (fileExt === 'pdf') {
        console.log(`Processing PDF file with options: 
          - Extract text: ${extractPdfText}
          - Use Vision API: ${useVisionApi}
          - Store in Supabase: ${storePdfInSupabase}
          - Use OCR.space: ${useOcrSpace}`
        );
        
        if (setIsProcessingPdf) {
          setIsProcessingPdf(true);
        }
        
        // If OCR.space is selected and user is authenticated
        if (useOcrSpace && isAuthenticated) {
          console.log("Using OCR.space for PDF processing");
          
          const result = await processPdfWithOcrSpace(
            file,
            (result) => {
              if (isCancelled) return;
              
              if (setIsProcessingPdf) {
                setIsProcessingPdf(false);
              }
              
              completeProgress();
              
              if (result.transactions && result.transactions.length > 0) {
                console.log(`Successfully extracted ${result.transactions.length} transactions from OCR.space`);
                onTransactionsParsed(result.transactions);
              } else if (result.extractedText) {
                // If we have text but no structured transactions, try to parse the text
                console.log("Got extracted text but no structured transactions, attempting to parse text");
                
                // Create an async function to handle the text parsing
                const parseExtractedText = async () => {
                  try {
                    const { extractStructuredDataFromPdf } = await import("../parsers/edge-function/pdfToImageProcessor");
                    const structuredData = extractStructuredDataFromPdf(result.extractedText);
                    
                    if (structuredData.transactions.length > 0) {
                      console.log(`Parsed ${structuredData.transactions.length} transactions from OCR text`);
                      onTransactionsParsed(structuredData.transactions);
                    } else {
                      // If we couldn't parse structured data, fall back to regular PDF parsing
                      console.log("Could not extract structured data from text, falling back to regular PDF parsing");
                      parsePDFFile(
                        file,
                        onTransactionsParsed,
                        onError,
                        "expense",
                        storePdfInSupabase
                      );
                    }
                  } catch (error) {
                    console.error("Error extracting structured data from text:", error);
                    // Fall back to regular PDF parsing
                    parsePDFFile(
                      file,
                      onTransactionsParsed,
                      onError,
                      "expense",
                      storePdfInSupabase
                    );
                  }
                };
                
                // Execute the async function
                parseExtractedText();
              } else {
                // If we couldn't extract text or transactions, fall back to regular PDF parsing
                console.log("No transactions or text extracted, falling back to regular PDF parsing");
                parsePDFFile(
                  file,
                  onTransactionsParsed,
                  onError,
                  "expense",
                  storePdfInSupabase
                );
              }
              
              stopProcessing();
            },
            (errorMessage) => {
              if (isCancelled) return true;
              
              if (setIsProcessingPdf) {
                setIsProcessingPdf(false);
              }
              
              console.log("OCR.space processing failed, falling back to regular PDF parsing:", errorMessage);
              
              // Fall back to regular PDF parsing
              parsePDFFile(
                file,
                onTransactionsParsed,
                onError,
                "expense",
                storePdfInSupabase
              );
              
              return false; // Don't trigger error yet, as we're falling back
            }
          );
        }
        // Otherwise use Google Vision or standard PDF processing
        else if (extractPdfText) {
          console.log(`Processing PDF file as images with Vision API: ${useVisionApi}`);
          
          const result = await processPdfAsImages(
            file,
            (result) => {
              if (isCancelled) return;
              
              if (setIsProcessingPdf) {
                setIsProcessingPdf(false);
              }
              
              completeProgress();
              
              if (result.transactions && result.transactions.length > 0) {
                console.log(`Successfully extracted ${result.transactions.length} transactions from PDF images`);
                onTransactionsParsed(result.transactions);
              } else if (result.extractedText) {
                // If we have text but no structured transactions, try to parse the text
                console.log("Got extracted text but no structured transactions, attempting to parse text");
                
                // Create an async function to handle the text parsing
                const parseExtractedText = async () => {
                  try {
                    const { extractStructuredDataFromPdf } = await import("../parsers/edge-function/pdfToImageProcessor");
                    const structuredData = extractStructuredDataFromPdf(result.extractedText);
                    
                    if (structuredData.transactions.length > 0) {
                      console.log(`Parsed ${structuredData.transactions.length} transactions from extracted text`);
                      onTransactionsParsed(structuredData.transactions);
                    } else {
                      // If we couldn't parse structured data, fall back to regular PDF parsing
                      console.log("Could not extract structured data from text, falling back to regular PDF parsing");
                      parsePDFFile(
                        file,
                        onTransactionsParsed,
                        onError,
                        "expense",
                        storePdfInSupabase
                      );
                    }
                  } catch (error) {
                    console.error("Error extracting structured data from text:", error);
                    // Fall back to regular PDF parsing
                    parsePDFFile(
                      file,
                      onTransactionsParsed,
                      onError,
                      "expense",
                      storePdfInSupabase
                    );
                  }
                };
                
                // Execute the async function
                parseExtractedText();
              } else {
                // If we couldn't extract text or transactions, fall back to regular PDF parsing
                console.log("No transactions or text extracted, falling back to regular PDF parsing");
                parsePDFFile(
                  file,
                  onTransactionsParsed,
                  onError,
                  "expense",
                  storePdfInSupabase
                );
              }
              
              stopProcessing();
            },
            (errorMessage) => {
              if (isCancelled) return true;
              
              if (setIsProcessingPdf) {
                setIsProcessingPdf(false);
              }
              
              console.log("PDF image processing failed, falling back to regular PDF parsing:", errorMessage);
              
              // Fall back to regular PDF parsing
              parsePDFFile(
                file,
                onTransactionsParsed,
                onError,
                "expense",
                storePdfInSupabase
              );
              
              return false; // Don't trigger error yet, as we're falling back
            },
            setIsProcessingPdf
          );
        } else {
          console.log(`Processing PDF file with standard parser and Vision API: ${useVisionApi}`);
          parsePDFFile(
            file, 
            onTransactionsParsed, 
            onError,
            "expense", 
            storePdfInSupabase
          );
        }
      } 
      // For non-PDFs
      else {
        console.log(`Processing ${fileExt} file with standard parser`);
        
        if (!isAuthenticated) {
          // For non-PDFs, try client-side parsing first if not authenticated
          parseStatementFile(
            file,
            (result) => {
              if (isCancelled) return;
              
              completeProgress();
              
              // Check if we got transactions array or CSV parse result
              const transactions = Array.isArray(result) ? result : result.transactions || result.data;
              console.log(`Successfully parsed ${transactions.length} transactions`);
              
              onTransactionsParsed(transactions);
              stopProcessing();
            },
            (errorMessage) => {
              if (isCancelled) return;
              
              onError(errorMessage);
              stopProcessing();
            }
          );
        } else {
          // If authenticated, we want to use the edge function for all file types
          setProcessingStatus(`Processing ${fileExt} file with AI...`);
          
          try {
            const fileProcessingModule = await import("../../../../hooks/useFileProcessing");
            
            // Check if processServerSide exists in the module
            if (typeof fileProcessingModule.processServerSide === 'function') {
              fileProcessingModule.processServerSide(
                file,
                onTransactionsParsed,
                onError,
                resetProgress,
                completeProgress,
                isCancelled,
                setIsWaitingForServer,
                {
                  preferredProvider: preferredAIProvider,
                  useVision: useVisionApi,
                  storePdfInSupabase,
                  extractPdfText,
                  useOcrSpace
                }
              );
            } else {
              // Fallback if processServerSide doesn't exist
              const { useFileProcessing } = fileProcessingModule;
              const { processServerSide } = useFileProcessing();
              
              processServerSide(
                file,
                onTransactionsParsed,
                onError,
                resetProgress,
                completeProgress,
                isCancelled,
                setIsWaitingForServer,
                {
                  preferredProvider: preferredAIProvider,
                  useVision: useVisionApi,
                  storePdfInSupabase,
                  extractPdfText,
                  useOcrSpace
                }
              );
            }
          } catch (error: any) {
            console.error("Error importing or using processServerSide:", error);
            onError("Failed to load server processing module. Please try again.");
            stopProcessing();
          }
        }
      }
    } catch (error: any) {
      if (isCancelled) return;
      
      if (setIsProcessingPdf) {
        setIsProcessingPdf(false);
      }
      
      onError(error.message || "Unexpected error processing file");
      stopProcessing();
    }
  }, [
    onTransactionsParsed,
    onError,
    startProgress,
    resetProgress,
    completeProgress,
    isCancelled,
    setIsWaitingForServer,
    startProcessing,
    stopProcessing,
    storePdfInSupabase,
    extractPdfText,
    setIsProcessingPdf,
    useOcrSpace
  ]);

  return {
    processStatement,
    processingStatus
  };
};
