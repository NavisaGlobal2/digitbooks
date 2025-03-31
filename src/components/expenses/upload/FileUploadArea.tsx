
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  errorState?: string | null;
}

const FileUploadArea = ({ file, onFileChange, disabled = false, errorState }: FileUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleAreaClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div>
      <Label htmlFor="bank-statement" className="mb-2 block">
        Select statement file
      </Label>
      <div className="mt-1">
        <div 
          onClick={handleAreaClick}
          className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 
            ${file ? (errorState ? 'border-red-300' : 'border-green-300') : 'border-gray-300'} 
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'border-dashed hover:border-gray-400 cursor-pointer'} 
            rounded-md appearance-none focus:outline-none`}
        >
          {file ? (
            <div className="text-center">
              <p className="text-sm text-gray-600">{file.name}</p>
              <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              {file.size > 5 * 1024 * 1024 && (
                <p className="text-xs text-amber-500 mt-1">
                  Large file might take longer to process
                </p>
              )}
              {!isAcceptedFileType(file.name) && (
                <p className="text-xs text-red-500 mt-1">
                  Unsupported file format. Please upload CSV, Excel or PDF files only
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-2">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                Drop your bank statement here or click to browse
              </span>
              <span className="text-xs text-gray-400">
                Supports CSV, Excel and PDF formats
              </span>
            </div>
          )}
        </div>
        {/* Hidden file input that gets triggered by the area click */}
        <input
          ref={fileInputRef}
          id="bank-statement"
          type="file"
          className="hidden"
          accept=".csv,.xls,.xlsx,.pdf"
          onChange={onFileChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

// Helper function to check if file type is accepted
const isAcceptedFileType = (filename: string): boolean => {
  const ext = filename.toLowerCase().split('.').pop();
  return ext === 'csv' || ext === 'xls' || ext === 'xlsx' || ext === 'pdf';
};

export default FileUploadArea;
