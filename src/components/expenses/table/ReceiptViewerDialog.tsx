
import { useState, useEffect } from "react";
import { DialogTitle, DialogDescription, Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface ReceiptViewerDialogProps {
  receiptUrl: string | null;
  onClose: () => void;
}

const ReceiptViewerDialog = ({ receiptUrl, onClose }: ReceiptViewerDialogProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reset loading state when receipt URL changes
  useEffect(() => {
    if (receiptUrl) {
      setIsLoading(true);
      setError(null);
    }
  }, [receiptUrl]);

  if (!receiptUrl) return null;
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError("Failed to load receipt image. The image may be corrupted or no longer available.");
  };

  return (
    <Dialog open={!!receiptUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle>Receipt Viewer</DialogTitle>
        <DialogDescription>
          Receipt image for your expense
        </DialogDescription>
        
        <div className="w-full p-1 relative min-h-[200px]">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-red-500 text-center p-4">
              {error}
            </div>
          )}
          
          <img 
            src={receiptUrl} 
            alt="Receipt" 
            className="w-full h-auto max-h-[60vh] object-contain"
            style={{ display: isLoading ? 'none' : 'block' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewerDialog;
