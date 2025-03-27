
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ReceiptViewerDialogProps {
  receiptUrl: string | null;
  onClose: () => void;
}

const ReceiptViewerDialog = ({ receiptUrl, onClose }: ReceiptViewerDialogProps) => {
  if (!receiptUrl) return null;
  
  return (
    <Dialog open={!!receiptUrl} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="w-full p-1">
          <img 
            src={receiptUrl} 
            alt="Receipt" 
            className="w-full h-auto max-h-[70vh] object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReceiptViewerDialog;
