
import FileUploadArea from "../FileUploadArea";
import ProgressIndicator from "../components/ProgressIndicator";
import ErrorDisplay from "../ErrorDisplay";
import UploadDialogFooter from "../UploadDialogFooter";
import ProcessingModeToggle from "./ProcessingModeToggle";

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
  setUseVisionApi: (useVision: boolean) => void;
  storePdfInSupabase: boolean;
  onStorePdfToggle: (value: boolean) => void;
  extractPdfText: boolean;
  onExtractPdfTextToggle: (value: boolean) => void;
  isProcessingPdf: boolean;
  useOcrSpace?: boolean;
  onOcrSpaceToggle?: (value: boolean) => void;
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
  storePdfInSupabase,
  onStorePdfToggle,
  extractPdfText,
  onExtractPdfTextToggle,
  isProcessingPdf,
  useOcrSpace = false,
  onOcrSpaceToggle
}: UploadDialogContentProps) => {
  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-medium">Upload Bank Statement</h2>
        <p className="text-sm text-muted-foreground">
          Upload your bank statement file to automatically import transactions.
        </p>
      </div>

      <FileUploadArea
        file={file}
        onFileChange={handleFileChange}
        disabled={uploading}
      />

      <ErrorDisplay error={error} />

      <ProgressIndicator
        progress={progress}
        step={step}
        isVisible={uploading}
        isWaitingForServer={isWaitingForServer}
        isProcessingPdf={isProcessingPdf}
        onCancel={onClose}
      />

      {isAuthenticated && !uploading && (
        <div className="space-y-3">
          {/* AI Provider and Processing Options */}
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
        </div>
      )}

      <UploadDialogFooter
        file={file}
        uploading={uploading}
        parseFile={parseFile}
        onClose={onClose}
      />
    </div>
  );
};

export default UploadDialogContent;
