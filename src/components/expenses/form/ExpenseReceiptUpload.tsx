
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface ExpenseReceiptUploadProps {
  receiptFile: File | null;
  setReceiptFile: (file: File | null) => void;
  receiptPreview: string | null;
  setReceiptPreview: (preview: string | null) => void;
}

const ExpenseReceiptUpload = ({
  receiptFile,
  setReceiptFile,
  receiptPreview,
  setReceiptPreview
}: ExpenseReceiptUploadProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setReceiptFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Label htmlFor="receipt">Receipt (Optional)</Label>
      <div className="mt-1 flex items-center">
        <label className="block w-full">
          <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none">
            {receiptPreview ? (
              <img
                src={receiptPreview}
                alt="Receipt preview"
                className="h-full max-h-28 object-contain"
                crossOrigin="anonymous"
              />
            ) : (
              <span className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Click to upload receipt
                </span>
              </span>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
        </label>
      </div>
    </div>
  );
};

export default ExpenseReceiptUpload;
