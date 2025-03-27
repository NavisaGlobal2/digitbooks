
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  errorState?: string | null;
}

const FileUploadArea = ({ file, onFileChange, disabled = false, errorState }: FileUploadAreaProps) => {
  return (
    <div>
      <Label htmlFor="bank-statement" className="mb-2 block">
        Select statement file
      </Label>
      <div className="mt-1">
        <label className={`block w-full ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
          <div className={`flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 
            ${file ? (errorState ? 'border-red-300' : 'border-green-300') : 'border-gray-300'} 
            ${disabled ? 'bg-gray-100' : 'border-dashed hover:border-gray-400'} 
            rounded-md appearance-none focus:outline-none`}>
            {file ? (
              <div className="text-center">
                <p className="text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                {file.size > 5 * 1024 * 1024 && (
                  <p className="text-xs text-amber-500 mt-1">
                    Large file might take longer to process
                  </p>
                )}
                {file.name.toLowerCase().endsWith('.pdf') && (
                  <p className="text-xs text-amber-500 mt-1">
                    PDF files require AI-powered processing with authentication
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
                  Supports CSV, Excel, PDF with AI-powered processing
                </span>
              </div>
            )}
            <input
              id="bank-statement"
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={onFileChange}
              disabled={disabled}
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUploadArea;
