
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ReceiptUploaderProps {
  paymentId: string;
  receiptUrl: string | null | undefined;
  onUpload: (id: string, file: File) => void;
}

export const ReceiptUploader = ({ paymentId, receiptUrl, onUpload }: ReceiptUploaderProps) => {
  return (
    <>
      <Label>Receipt (Recommended)</Label>
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={`receipt-${paymentId}`}
          className="flex h-10 flex-1 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Upload className="mr-2 h-4 w-4" />
          {receiptUrl ? "Change Receipt" : "Upload Receipt"}
        </Label>
        <Input
          id={`receipt-${paymentId}`}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onUpload(paymentId, e.target.files[0]);
            }
          }}
        />
        {receiptUrl && (
          <Button variant="outline" size="icon" asChild>
            <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
              <span className="sr-only">View Receipt</span>
              <span className="h-4 w-4">👁️</span>
            </a>
          </Button>
        )}
      </div>
    </>
  );
};
