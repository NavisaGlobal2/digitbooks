
import React from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FileUploadArea from "../FileUploadArea";
import ErrorDisplay from "../ErrorDisplay";
import ProcessingModeToggle from "./ProcessingModeToggle";
import ProgressIndicator from "./ProgressIndicator";
import SupportedFormatsInfo from "./SupportedFormatsInfo";
import ConnectionStats from "./ConnectionStats";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface UploadDialogContentProps {
  file: File | null;
  uploading: boolean;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseFile: () => void;
  onClose: () => void;
  progress: number;
  step: string | null;
  isAuthenticated: boolean | null;
  preferredAIProvider: string;
  setPreferredAIProvider: (provider: string) => void;
  isWaitingForServer: boolean;
  useVisionApi: boolean;
  setUseVisionApi: (use: boolean) => void;
  storePdfInSupabase?: boolean;
  onStorePdfToggle?: (value: boolean) => void;
  extractPdfText?: boolean;
  onExtractPdfTextToggle?: (value: boolean) => void;
  isProcessingPdf?: boolean;
}

const UploadDialogContent = ({
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
  storePdfInSupabase = false,
  onStorePdfToggle,
  extractPdfText = false,
  onExtractPdfTextToggle,
  isProcessingPdf = false
}: UploadDialogContentProps) => {
  const isPdf = file?.name.toLowerCase().endsWith('.pdf');
  
  return (
    <>
      <DialogHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <DialogTitle>Upload Bank Statement</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={onClose}
            disabled={uploading}
          >
            <span className="sr-only">Close</span>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {error && <ErrorDisplay error={error} />}

        {!uploading && (
          <>
            <FileUploadArea
              file={file}
              onFileChange={handleFileChange}
              disabled={uploading}
            />

            {file && (
              <div className="space-y-4">
                <ProcessingModeToggle
                  title="AI Provider"
                  description="Select which AI provider to use for processing your statement"
                  options={[
                    { value: "anthropic", label: "Claude" },
                    { value: "deepseek", label: "DeepSeek" }
                  ]}
                  value={preferredAIProvider}
                  onChange={setPreferredAIProvider}
                />

                {isPdf && (
                  <>
                    <ProcessingModeToggle
                      title="Google Vision OCR"
                      description="Use Google Vision API for PDF processing (recommended)"
                      options={[
                        { value: "true", label: "Enabled" },
                        { value: "false", label: "Disabled" }
                      ]}
                      value={useVisionApi ? "true" : "false"}
                      onChange={(value) => setUseVisionApi(value === "true")}
                    />
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="store-pdf" 
                        checked={storePdfInSupabase}
                        onCheckedChange={onStorePdfToggle}
                      />
                      <Label htmlFor="store-pdf">Store PDF in Supabase Storage</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="extract-pdf-text" 
                        checked={extractPdfText}
                        onCheckedChange={onExtractPdfTextToggle}
                      />
                      <Label htmlFor="extract-pdf-text">Convert PDF to images for OCR</Label>
                    </div>
                  </>
                )}
              </div>
            )}

            <SupportedFormatsInfo />
          </>
        )}

        {uploading && (
          <div className="pt-4">
            <ProgressIndicator
              progress={progress}
              step={step}
              isWaitingForServer={isWaitingForServer}
              isProcessingPdf={isProcessingPdf}
              onCancel={onClose}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <ConnectionStats />
        
        <div className="flex space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={uploading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={parseFile}
            disabled={!file || uploading || !isAuthenticated}
          >
            Upload
          </Button>
        </div>
      </div>
    </>
  );
};

export default UploadDialogContent;
