
import { Button } from "@/components/ui/button";
import { Download, Share2 } from "lucide-react";
import { InvoiceItem } from "@/types/invoice";

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
  accountName: string;
  clientName: string;
  selectedTemplate: string;
}

const ActionButtons = ({
  handleGenerateInvoice,
  handleShareInvoice,
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  accountName,
  clientName,
  selectedTemplate
}: ActionButtonsProps) => {
  return (
    <div className="flex flex-col xs:flex-row gap-3">
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={handleGenerateInvoice}
      >
        <Download className="h-4 w-4" />
        <span>Download PDF</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center gap-2"
        onClick={handleShareInvoice}
      >
        <Share2 className="h-4 w-4" />
        <span>Share Invoice</span>
      </Button>
    </div>
  );
};

export default ActionButtons;
