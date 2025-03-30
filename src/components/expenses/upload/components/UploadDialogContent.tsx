
import { DialogDescription } from "@/components/ui/dialog";
import FileUploadArea from "../FileUploadArea";
import ErrorDisplay from "../ErrorDisplay";
import ProgressIndicator from "./ProgressIndicator";
import SupportedFormatsInfo from "./SupportedFormatsInfo";
import UploadDialogFooter from "../UploadDialogFooter";
import DialogHeader from "../DialogHeader";
import { downloadCSVTemplate } from "@/utils/csvTemplateGenerator";

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
  isAuthenticated
}: UploadDialogContentProps) => {
  const handleDownloadTemplate = () => {
    downloadCSVTemplate();
  };

  return (
    <>
      <DialogHeader title="Upload Bank Statement" />
      <DialogDescription className="text-center text-sm text-muted-foreground">
        Upload your bank statement CSV to automatically create expenses
      </DialogDescription>
      
      <div className="space-y-4 p-4 pt-2">
        <ErrorDisplay error={error} />
        
        <FileUploadArea 
          file={file} 
          onFileChange={handleFileChange} 
          disabled={uploading}
          errorState={error}
        />
        
        {!isAuthenticated && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
            You need to be signed in to use this feature. Please sign in and try again.
          </div>
        )}
        
        <ProgressIndicator 
          progress={progress} 
          step={step} 
          isVisible={uploading}
        />
        
        <SupportedFormatsInfo 
          isAuthenticated={isAuthenticated} 
          onDownloadTemplate={handleDownloadTemplate}
        />
        
        <UploadDialogFooter
          onCancel={onClose}
          onParse={parseFile}
          uploading={uploading}
          disabled={!file || !isAuthenticated || (file && !file.name.toLowerCase().endsWith('.csv'))}
          showCancelButton={uploading}
        />
      </div>
    </>
  );
};

export default UploadDialogContent;
