import { Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { downloadInvoice, shareInvoice } from "@/utils/invoice/documentActions";

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  tax: number;
}

interface ActionButtonsProps {
  handleGenerateInvoice: () => void;
  handleShareInvoice: () => void;
  isAccountVerified: boolean;
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  swiftCode: string;
  accountName: string;
}

const ActionButtons = ({ 
  isAccountVerified,
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  swiftCode,
  accountName
}: ActionButtonsProps) => {
  
  const generateAndDownloadInvoice = async () => {
    try {
      await downloadInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        swiftCode,
        accountName
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Could not generate invoice. Please try again.");
    }
  };

  const generateAndShareInvoice = async () => {
    try {
      await shareInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        swiftCode,
        accountName
      });
    } catch (error) {
      console.error("Error sharing invoice:", error);
      toast.error("Could not share invoice. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Button 
        className="bg-[#05D166] hover:bg-[#05D166]/80 text-white flex items-center justify-center gap-2"
        onClick={generateAndDownloadInvoice}
      >
        <Download className="h-5 w-5" />
        <span>Download</span>
      </Button>
      <Button 
        variant="outline" 
        className="border-[#05D166] text-[#05D166] hover:bg-[#05D166]/10 flex items-center justify-center gap-2"
        onClick={generateAndShareInvoice}
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
