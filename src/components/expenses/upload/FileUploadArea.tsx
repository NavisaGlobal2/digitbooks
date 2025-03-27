
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";

interface FileUploadAreaProps {
  file: File | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileUploadArea = ({ file, onFileChange }: FileUploadAreaProps) => {
  return (
    <div>
      <Label htmlFor="bank-statement" className="mb-2 block">
        Select statement file
      </Label>
      <div className="mt-1">
        <label className="block w-full">
          <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
            {file ? (
              <div className="text-center">
                <p className="text-sm text-gray-600">{file.name}</p>
                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Drop your bank statement here or click to browse
                </span>
                <span className="text-xs text-gray-400">
                  Supports CSV, Excel, PDF
                </span>
              </div>
            )}
            <input
              id="bank-statement"
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={onFileChange}
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default FileUploadArea;
