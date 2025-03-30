
import React from "react";
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import ConnectionStatistics from "./ConnectionStatistics";
import { useAuth } from "@/contexts/auth";

interface UploadDialogContentProps {
  file: File | null;
  uploading: boolean;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseFile: () => void;
  onClose: () => void;
  progress: number;
  step: string;
  isAuthenticated: boolean | null;
  preferredAIProvider: string;
  setPreferredAIProvider: (provider: string) => void;
  isWaitingForServer?: boolean;
  useVisionApi?: boolean;
  setUseVisionApi?: (use: boolean) => void;
  storePdfInSupabase?: boolean;
  onStorePdfToggle?: (store: boolean) => void;
  extractPdfText?: boolean;
  onExtractPdfTextToggle?: (extract: boolean) => void;
  isProcessingPdf?: boolean;
  useOcrSpace?: boolean;
  onOcrSpaceToggle?: (use: boolean) => void;
}

const UploadDialogContent: React.FC<UploadDialogContentProps> = ({
  file,
  uploading,
  error,
  handleFileChange,
  parseFile,
  onClose,
  progress,
  step,
  isAuthenticated,
  preferredAIProvider,
  setPreferredAIProvider,
  isWaitingForServer,
  useVisionApi,
  setUseVisionApi,
  storePdfInSupabase,
  onStorePdfToggle,
  extractPdfText,
  onExtractPdfTextToggle,
  isProcessingPdf,
  useOcrSpace,
  onOcrSpaceToggle
}) => {
  // Get auth context
  const { isAuthenticated: authContextAuth, user } = useAuth();
  
  // Determine final authentication status (priority to direct auth check)
  const isUserAuthenticated = isAuthenticated !== null ? isAuthenticated : authContextAuth;
  
  return (
    <>
      <DialogHeader>
        <DialogTitle>Upload Bank Statement</DialogTitle>
        <DialogDescription>
          Upload a CSV, Excel or PDF file from your bank to import transactions.
        </DialogDescription>
      </DialogHeader>
      
      {!isUserAuthenticated && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
          <h4 className="text-amber-800 font-medium">Authentication Required</h4>
          <p className="text-amber-700 text-sm mt-1">
            You need to be signed in to upload and process bank statements.
          </p>
        </div>
      )}
      
      <div className="space-y-4">
        {!file && (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Upload className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600">
              Click to browse or drag and drop
            </p>
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept=".csv,.xls,.xlsx,.pdf"
              onChange={handleFileChange}
              disabled={uploading || !isUserAuthenticated}
            />
          </div>
        )}
        
        {file && (
          <div className="flex items-center justify-between border rounded-md p-3">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded">
                <Upload className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3 truncate">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            {!uploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 flex items-center justify-center"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove file</span>
              </Button>
            )}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">
                {isWaitingForServer 
                  ? "Processing file on server..." 
                  : isProcessingPdf 
                    ? "Processing PDF..." 
                    : "Uploading..."}
              </p>
              <span className="text-xs text-gray-500">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
            {isWaitingForServer && (
              <p className="text-xs text-gray-600">
                This may take a moment... We're extracting transaction data from your file.
              </p>
            )}
          </div>
        )}
        
        {file && !uploading && (
          <>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="ai-provider" className="text-sm font-medium">
                  Preferred AI Provider
                </label>
                <select
                  id="ai-provider"
                  value={preferredAIProvider}
                  onChange={(e) => setPreferredAIProvider(e.target.value)}
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="anthropic">Anthropic (Claude)</option>
                  <option value="deepseek">DeepSeek</option>
                </select>
              </div>
              
              {file.name.toLowerCase().endsWith('.pdf') && (
                <>
                  {onStorePdfToggle && (
                    <div className="flex items-center justify-between">
                      <label htmlFor="store-pdf" className="text-sm font-medium">
                        Store PDF in Supabase
                      </label>
                      <input
                        id="store-pdf"
                        type="checkbox"
                        checked={!!storePdfInSupabase}
                        onChange={(e) => onStorePdfToggle(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  )}
                  
                  {onExtractPdfTextToggle && (
                    <div className="flex items-center justify-between">
                      <label htmlFor="extract-text" className="text-sm font-medium">
                        Extract PDF text with Vision API
                      </label>
                      <input
                        id="extract-text"
                        type="checkbox"
                        checked={!!extractPdfText}
                        onChange={(e) => onExtractPdfTextToggle(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  )}
                  
                  {onOcrSpaceToggle && (
                    <div className="flex items-center justify-between">
                      <div>
                        <label htmlFor="use-ocr-space" className="text-sm font-medium">
                          Use OCR.space for PDF processing
                        </label>
                        <p className="text-xs text-gray-500">
                          Alternative OCR service (requires API key)
                        </p>
                      </div>
                      <input
                        id="use-ocr-space"
                        type="checkbox"
                        checked={!!useOcrSpace}
                        onChange={(e) => onOcrSpaceToggle(e.target.checked)}
                        className="rounded"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                onClick={parseFile}
                disabled={!isUserAuthenticated}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Process File
              </Button>
            </div>
          </>
        )}
        
        {!file && !uploading && (
          <ConnectionStatistics />
        )}
      </div>
    </>
  );
};

export default UploadDialogContent;
