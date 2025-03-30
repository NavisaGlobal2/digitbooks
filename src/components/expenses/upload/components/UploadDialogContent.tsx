
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import ProcessingModeToggle from "./ProcessingModeToggle";

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
  useVisionApi: boolean;
  setUseVisionApi: (useVision: boolean) => void;
  isWaitingForServer?: boolean;
  storePdfInSupabase: boolean;
  onStorePdfToggle: (value: boolean) => void;
  extractPdfText: boolean;
  onExtractPdfTextToggle: (value: boolean) => void;
  isProcessingPdf?: boolean;
  useOcrSpace: boolean;
  onOcrSpaceToggle: (value: boolean) => void;
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
  useVisionApi,
  setUseVisionApi,
  isWaitingForServer = false,
  storePdfInSupabase,
  onStorePdfToggle,
  extractPdfText,
  onExtractPdfTextToggle,
  isProcessingPdf = false,
  useOcrSpace,
  onOcrSpaceToggle
}) => {
  const isPdf = file && file.type === 'application/pdf';
  
  // Check if using OCR.space but not authenticated
  const showOcrSpaceWarning = useOcrSpace && !isAuthenticated;
  
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Upload bank statement</h2>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onClose}
          disabled={uploading}
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="ml-2">{error}</AlertDescription>
        </Alert>
      )}
      
      {useOcrSpace && error?.includes('OCR.space API key is not configured') && (
        <Alert variant="warning" className="mb-4 border-yellow-500 text-yellow-800 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-800" />
          <AlertDescription className="ml-2">
            <strong>OCR.space API Key Missing</strong>
            <p className="text-sm">
              The OCR.space API key needs to be configured in your Supabase project.
              Set the environment variable <code className="bg-yellow-100 p-1 rounded">OCR_SPACE_API_KEY</code> in your Supabase Edge Function settings.
            </p>
            <p className="text-sm mt-1">
              You can get a free OCR.space API key at <a href="https://ocr.space/ocrapi" target="_blank" rel="noopener noreferrer" className="underline text-blue-600">ocr.space</a>.
            </p>
          </AlertDescription>
        </Alert>
      )}
      
      {showOcrSpaceWarning && (
        <Alert variant="warning" className="mb-4 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="ml-2">
            You must be logged in to use OCR.space processing.
          </AlertDescription>
        </Alert>
      )}
      
      {isProcessingPdf && (
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="ml-2 text-blue-700">
            Processing PDF document. This may take a few moments...
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div 
          className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer ${
            file ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onClick={() => document.getElementById('file-upload')?.click()}
        >
          {file ? (
            <div className="flex flex-col items-center">
              <FileText className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-sm font-medium text-green-600">{file.name}</p>
              <p className="text-xs text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="text-red-500 mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  const fileInput = document.getElementById('file-upload') as HTMLInputElement;
                  if (fileInput) fileInput.value = '';
                  handleFileChange({ target: { files: null } } as any);
                }}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="mb-1 text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                CSV, Excel or PDF files
              </p>
            </>
          )}
          <input
            id="file-upload"
            type="file"
            accept=".csv,.xls,.xlsx,.pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <ProcessingModeToggle
          preferredAIProvider={preferredAIProvider}
          setPreferredAIProvider={setPreferredAIProvider}
          useVisionApi={useVisionApi}
          setUseVisionApi={setUseVisionApi}
          storePdfInSupabase={storePdfInSupabase}
          onStorePdfToggle={onStorePdfToggle}
          extractPdfText={extractPdfText}
          onExtractPdfTextToggle={onExtractPdfTextToggle}
          useOcrSpace={useOcrSpace}
          onOcrSpaceToggle={onOcrSpaceToggle}
        />

        {uploading && (
          <div className="pt-2 pb-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">{step}</p>
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            disabled={!file || uploading}
            onClick={parseFile}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            {uploading ? 'Processing...' : 'Parse Statement'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UploadDialogContent;
