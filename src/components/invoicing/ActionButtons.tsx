
import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ActionButtonsProps {
  handleGenerateInvoice: () => void;
  handleShareInvoice: () => void;
}

const ActionButtons = ({ handleGenerateInvoice, handleShareInvoice }: ActionButtonsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button 
        className="bg-green-500 hover:bg-green-600 text-white flex items-center justify-center gap-2"
        onClick={handleGenerateInvoice}
      >
        <Download className="h-5 w-5" />
        <span>Download</span>
      </Button>
      <Button 
        variant="outline" 
        className="border-green-500 text-green-500 hover:bg-green-50 flex items-center justify-center gap-2"
        onClick={handleShareInvoice}
      >
        <Share2 className="h-5 w-5" />
        <span>Share Invoice</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
