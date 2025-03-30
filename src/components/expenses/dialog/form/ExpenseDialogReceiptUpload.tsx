
import { Upload } from "lucide-react";
import { useRef } from "react";

interface ExpenseDialogReceiptUploadProps {
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
}

const ExpenseDialogReceiptUpload = ({
  receiptFile,
  setReceiptFile,
}: ExpenseDialogReceiptUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };
  
  const handleAreaClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Upload receipt (optional)
      </label>
      <div 
        onClick={handleAreaClick}
        className="border rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 text-gray-400 border rounded-full p-2">
            <Upload className="h-6 w-6" />
          </div>
          {receiptFile ? (
            <div className="text-sm">
              <p className="text-green-500 font-medium">{receiptFile.name}</p>
              <p className="text-gray-500 text-xs">
                {(receiptFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500">Drag & drop receipt</p>
              <p className="text-sm text-gray-400">or</p>
              <p className="text-sm text-green-500">Browse files</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ExpenseDialogReceiptUpload;
