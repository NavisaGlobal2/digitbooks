
import { DialogDescription } from "@/components/ui/dialog";
import FileUploadArea from "../FileUploadArea";
import ErrorDisplay from "../ErrorDisplay";
import ProcessingModeToggle from "./ProcessingModeToggle";
import ProgressIndicator from "./ProgressIndicator";
import SupportedFormatsInfo from "./SupportedFormatsInfo";
import UploadDialogFooter from "../UploadDialogFooter";
import DialogHeader from "../DialogHeader";

interface UploadDialogContentProps {
  file: File | null;
  uploading: boolean;
  error: string | null;
  useEdgeFunction: boolean;
  toggleEdgeFunction: () => void;
  edgeFunctionAvailable: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  parseFile: () => void;
  onClose: () => void;
  progress: number;
  step: string;
}

const UploadDialogContent = ({
  file,
  uploading,
  error,
  useEdgeFunction,
  toggleEdgeFunction,
  edgeFunctionAvailable,
  handleFileChange,
  parseFile,
  onClose,
  progress,
  step
}: UploadDialogContentProps) => {
  return (
    <>
      <DialogHeader title="Upload Bank Statement" />
      <DialogDescription className="text-center text-sm text-muted-foreground">
        Upload your bank statement to automatically create expenses
      </DialogDescription>
      
      <div className="space-y-4 p-4 pt-2">
        <ErrorDisplay error={error} />
        
        <FileUploadArea 
          file={file} 
          onFileChange={handleFileChange} 
          disabled={uploading}
          errorState={error}
        />
        
        <ProcessingModeToggle 
          useEdgeFunction={useEdgeFunction}
          toggleEdgeFunction={toggleEdgeFunction}
          edgeFunctionAvailable={edgeFunctionAvailable}
          disabled={uploading}
        />
        
        <ProgressIndicator 
          progress={progress} 
          step={step} 
          isVisible={uploading}
        />
        
        <SupportedFormatsInfo />
        
        <UploadDialogFooter
          onCancel={onClose}
          onParse={parseFile}
          uploading={uploading}
          disabled={!file}
          showCancelButton={uploading}
        />
      </div>
    </>
  );
};

export default UploadDialogContent;
