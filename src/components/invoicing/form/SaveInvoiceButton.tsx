
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

interface SaveInvoiceButtonProps {
  onSave: () => void;
}

const SaveInvoiceButton = ({ onSave }: SaveInvoiceButtonProps) => {
  return (
    <Button
      onClick={onSave}
      className="w-full py-2.5 bg-[#05D166] hover:bg-[#05D166]/80 text-white rounded-md transition-colors flex items-center justify-center gap-2"
    >
      <Save className="h-5 w-5" />
      <span>Save Invoice</span>
    </Button>
  );
};

export default SaveInvoiceButton;
