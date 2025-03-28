
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const FileUploadArea = ({ file, onFileChange, disabled = false }: FileUploadAreaProps) => {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center space-y-2">
        <div className="p-3 bg-muted rounded-full">
          <Upload className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium">
          {file ? file.name : 'Drag and drop your statement file, or click to select'}
        </p>
        <p className="text-xs text-muted-foreground">
          Supports CSV, Excel, and PDF files
        </p>
      </div>
      <div className="mt-4">
        <label className="cursor-pointer">
          <input
            type="file"
            className="hidden"
            accept=".csv, .xlsx, .xls, .pdf"
            onChange={onFileChange}
            disabled={disabled}
          />
          <div className="px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium">
            Select File
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUploadArea;
