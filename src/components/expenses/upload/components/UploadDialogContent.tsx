
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import FileUploadArea from "../FileUploadArea";
import ErrorDisplay from "../ErrorDisplay";
import ProgressIndicator from "./ProgressIndicator";
import ProcessingModeToggle from "./ProcessingModeToggle";
import SupportedFormatsInfo from "./SupportedFormatsInfo";
import { useState, useEffect } from "react";

interface UploadDialogContentProps {
  file: File | null;
  uploading: boolean;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseFile: () => void;
  onClose: () => void;
  progress: number;
  step: string;
  isAuthenticated?: boolean;
  preferredAIProvider?: string;
  setPreferredAIProvider?: (provider: string) => void;
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
  setPreferredAIProvider
}: UploadDialogContentProps) => {
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  const [edgeFunctionAvailable, setEdgeFunctionAvailable] = useState(true);
  
  const toggleEdgeFunction = () => {
    setUseEdgeFunction(!useEdgeFunction);
  };
  
  // Check if the CSV file has been selected
  const isCsvFile = file && file.name.toLowerCase().endsWith('.csv');
  
  // For non-CSV files, we should force edge function processing
  useEffect(() => {
    if (file && !file.name.toLowerCase().endsWith('.csv')) {
      setUseEdgeFunction(true);
    }
  }, [file]);

  return (
    <>
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Upload Bank Statement</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} disabled={uploading}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <DialogDescription>
          Upload your bank statement to extract transactions
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        {uploading ? (
          <ProgressIndicator progress={progress} step={step} onCancel={onClose} />
        ) : (
          <>
            <FileUploadArea 
              file={file} 
              handleFileChange={handleFileChange} 
              disabled={uploading} 
            />
            
            {file && isCsvFile && (
              <ProcessingModeToggle 
                useEdgeFunction={useEdgeFunction} 
                toggleEdgeFunction={toggleEdgeFunction}
                edgeFunctionAvailable={edgeFunctionAvailable}
                disabled={uploading}
                isAuthenticated={isAuthenticated}
                preferredAIProvider={preferredAIProvider}
                setPreferredAIProvider={setPreferredAIProvider}
              />
            )}
            
            {error && <ErrorDisplay error={error} />}
            
            <SupportedFormatsInfo />
            
            <div className="flex justify-end">
              <Button
                type="button"
                disabled={!file || uploading}
                onClick={parseFile}
              >
                Process Statement
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default UploadDialogContent;
