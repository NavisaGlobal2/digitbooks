
import { Upload } from "lucide-react";
import { useState } from "react";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

const FileUploadArea = ({ file, onFileChange, disabled = false }: FileUploadAreaProps) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.files = e.dataTransfer.files;
      const event = { target: fileInput } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileChange(event);
    }
  };

  return (
    <div 
      className={`border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-dashed'} rounded-lg p-6 flex flex-col items-center justify-center transition-colors ${disabled ? 'opacity-70' : 'cursor-pointer'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) {
          document.getElementById('file-upload')?.click();
        }
      }}
    >
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
        <label className={`${disabled ? '' : 'cursor-pointer'}`}>
          <input
            id="file-upload"
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
