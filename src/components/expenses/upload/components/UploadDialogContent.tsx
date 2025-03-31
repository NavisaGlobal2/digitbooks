
import { FileType } from "lucide-react";
import { ParsedTransaction } from "../parsers/types";
import ProcessingModeToggle from "./ProcessingModeToggle";
import ProgressIndicator from "./ProgressIndicator";
import SupportedFormatsInfo from "./SupportedFormatsInfo";
import { useState } from "react";
import { Button } from "@/components/ui/button";

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
  useAIFormatting?: boolean;
  setUseAIFormatting?: (value: boolean) => void;
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
  isAuthenticated = true,
  preferredAIProvider,
  setPreferredAIProvider,
  useAIFormatting = true,
  setUseAIFormatting
}: UploadDialogContentProps) => {
  const [useEdgeFunction, setUseEdgeFunction] = useState(true);
  
  // Edge function is always available but requires authentication
  const edgeFunctionAvailable = true;
  
  const toggleEdgeFunction = () => {
    setUseEdgeFunction(prev => !prev);
  };
  
  return (
    <>
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Upload bank statement</h2>
        <p className="text-muted-foreground text-sm">
          Upload your bank statement to automatically extract and categorize expenses.
        </p>
        
        {/* File upload area */}
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors bg-background">
          <div className="flex flex-col items-center text-center">
            <FileType className="h-8 w-8 text-muted-foreground mb-2" />
            <h3 className="text-base font-medium text-gray-900">Upload bank statement</h3>
            <p className="text-sm text-muted-foreground">
              {file ? file.name : "Drag and drop or click to select a file"}
            </p>
            <div className="mt-3">
              <label htmlFor="file-upload" className="text-sm text-blue-600 hover:text-blue-500 cursor-pointer">
                Browse files
                <input 
                  id="file-upload" 
                  name="file-upload" 
                  type="file" 
                  className="sr-only" 
                  onChange={handleFileChange}
                  accept=".csv,.xlsx,.xls"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Processing mode toggle */}
        <ProcessingModeToggle 
          useEdgeFunction={useEdgeFunction}
          toggleEdgeFunction={toggleEdgeFunction}
          edgeFunctionAvailable={edgeFunctionAvailable}
          disabled={uploading || !file}
          isAuthenticated={isAuthenticated}
          preferredAIProvider={preferredAIProvider}
          setPreferredAIProvider={setPreferredAIProvider}
          useAIFormatting={useAIFormatting}
          setUseAIFormatting={setUseAIFormatting}
        />
        
        {/* Format info */}
        <SupportedFormatsInfo />
        
        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {/* Progress bar if uploading */}
        {uploading && (
          <ProgressIndicator 
            progress={progress} 
            step={step}
            isVisible={true}
          />
        )}
      </div>
      
      {/* Footer buttons */}
      <div className="flex justify-between mt-4 pt-3 border-t">
        <Button variant="outline" onClick={onClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={parseFile} 
          disabled={!file || uploading || (!useEdgeFunction && !file?.name.toLowerCase().endsWith('.csv'))}
        >
          {uploading ? 'Processing...' : 'Process Statement'}
        </Button>
      </div>
    </>
  );
};

export default UploadDialogContent;
