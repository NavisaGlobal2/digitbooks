
import { DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, AlertTriangle } from "lucide-react";
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
  isWaitingForServer?: boolean;
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
  isWaitingForServer = false
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
          <ProgressIndicator 
            progress={progress} 
            step={step} 
            isVisible={true}
            isWaitingForServer={isWaitingForServer}
            onCancel={onClose}
          />
        ) : (
          <>
            {!isAuthenticated && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded mb-4">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 mr-2" />
                  <div>
                    <p className="font-bold">Authentication Required</p>
                    <p>You need to be signed in to upload bank statements. Please sign in and try again.</p>
                  </div>
                </div>
              </div>
            )}
            
            <FileUploadArea 
              file={file} 
              onFileChange={handleFileChange} 
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
                disabled={!file || uploading || !isAuthenticated}
                onClick={parseFile}
                className="bg-green-500 hover:bg-green-600 text-white"
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
