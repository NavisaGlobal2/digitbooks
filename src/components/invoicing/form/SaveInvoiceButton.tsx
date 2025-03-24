
import { Button } from "@/components/ui/button";

interface SaveInvoiceButtonProps {
  onSave: () => void;
}

const SaveInvoiceButton = ({ onSave }: SaveInvoiceButtonProps) => {
  return (
    <Button
      onClick={onSave}
      className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
    >
      Save Invoice
    </Button>
  );
};

export default SaveInvoiceButton;
