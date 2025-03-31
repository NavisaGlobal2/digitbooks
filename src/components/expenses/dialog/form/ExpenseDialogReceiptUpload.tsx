
import { Upload } from "lucide-react";

interface ExpenseDialogReceiptUploadProps {
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
}

const ExpenseDialogReceiptUpload = ({
  receiptFile,
  setReceiptFile,
}: ExpenseDialogReceiptUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptFile(e.target.files[0]);
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        Upload receipt (optional)
      </label>
      <div className="border rounded-md p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <div className="mb-2 text-gray-400 border rounded-full p-2">
            <Upload className="h-6 w-6" />
          </div>
          <p className="text-sm text-gray-500">Drag & drop receipt</p>
          <p className="text-sm text-gray-400">or</p>
          <label className="cursor-pointer">
            <span className="text-sm text-green-500">Browse files</span>
            <input
              type="file"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDialogReceiptUpload;
