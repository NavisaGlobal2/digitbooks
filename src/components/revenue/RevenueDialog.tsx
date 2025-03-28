
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface RevenueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

const RevenueDialog = ({ open, onOpenChange, title, children }: RevenueDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          <button 
            onClick={() => onOpenChange(false)} 
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </DialogHeader>
        
        <div className="px-6 py-2 max-h-[calc(70vh-100px)] overflow-y-auto">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevenueDialog;
