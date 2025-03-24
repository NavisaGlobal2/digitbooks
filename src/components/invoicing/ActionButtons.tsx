
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionButtonsProps {
  handleGenerateInvoice: () => void;
  handleShareInvoice: () => void;
  isAccountVerified: boolean;
}

const ActionButtons = ({ 
  handleGenerateInvoice, 
  handleShareInvoice, 
  isAccountVerified 
}: ActionButtonsProps) => {
  // Remove the verification check and allow actions regardless of verification status
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button 
        className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
        onClick={handleGenerateInvoice}
      >
        <Download className="h-5 w-5" />
        <span>Download</span>
      </Button>
      <Button 
        variant="outline" 
        className="border-green-600 text-green-600 hover:bg-green-50 flex items-center justify-center gap-2"
        onClick={handleShareInvoice}
      >
        <Share2 className="h-5 w-5" />
        <span>Share Invoice</span>
      </Button>
      {!isAccountVerified && (
        <p className="col-span-2 text-amber-600 text-sm">
          Note: Your bank account isn't verified. You can still proceed, but verification ensures accuracy.
        </p>
      )}
    </div>
  );
};

export default ActionButtons;
