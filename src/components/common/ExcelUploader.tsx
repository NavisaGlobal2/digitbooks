
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, X } from "lucide-react";
import { toast } from "sonner";
import { ExcelService, SheetData } from "@/services/excelService";

interface ExcelUploaderProps {
  onDataExtracted: (data: SheetData) => void;
  maxSize?: number; // in MB
  buttonText?: string;
  className?: string;
  allowedExtensions?: string[];
}

export const ExcelUploader = ({
  onDataExtracted,
  maxSize = 10,
  buttonText = "Upload Excel",
  className = "",
  allowedExtensions = ['.xlsx', '.xls', '.csv']
}: ExcelUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = async (selectedFile: File) => {
    // Validate file extension
    const fileExt = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExt)) {
      toast.error(`Unsupported file format. Please upload ${allowedExtensions.join(', ')} files.`);
      return;
    }
    
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (selectedFile.size > maxSizeBytes) {
      toast.error(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    setFile(selectedFile);
    setIsProcessing(true);
    
    try {
      const data = await ExcelService.readFile(selectedFile);
      onDataExtracted(data);
      toast.success("File processed successfully!");
    } catch (error) {
      console.error("Error processing Excel file:", error);
      toast.error("Failed to process file. Please check the format and try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };
  
  const clearFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className={`${className}`}>
      <div
        className={`border-2 ${isDragging ? 'border-green-500 bg-green-50' : 'border-dashed border-gray-300'} rounded-lg p-6 transition-colors ${isProcessing ? 'opacity-70' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="p-3 bg-muted rounded-full">
            <FileSpreadsheet className="h-8 w-8 text-green-600" />
          </div>
          
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium">
              {file ? file.name : 'Drag and drop your spreadsheet, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              {allowedExtensions.join(', ')} files up to {maxSize}MB
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={handleBrowseClick}
            disabled={isProcessing}
            className="relative"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : buttonText}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept={allowedExtensions.join(',')}
              onChange={handleInputChange}
              disabled={isProcessing}
            />
          </Button>
        </div>
      </div>
      
      {file && (
        <div className="mt-4 p-3 bg-slate-50 rounded-md flex items-center justify-between">
          <div className="flex items-center">
            <FileSpreadsheet className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={clearFile}
            className="h-8 w-8"
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
