
import { Download, Image, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InvoiceItem } from "@/types/invoice";
import { downloadInvoice, shareInvoice, captureInvoiceAsImage } from "@/utils/invoice/documentActions";

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
  clientName?: string;
  selectedTemplate?: string;
}

const ActionButtons = ({
  handleGenerateInvoice,
  handleShareInvoice,
  isAccountVerified,
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  swiftCode,
  accountName,
  clientName = "Client",
  selectedTemplate = "default"
}: ActionButtonsProps) => {
  
  const handleDownloadAsPdf = async () => {
    try {
      toast.loading("Converting invoice to PDF...");
      
      const result = await downloadInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        swiftCode,
        accountName,
        clientName,
        selectedTemplate
      });
      
      if (result) {
        // Call the parent's handler for analytics/tracking
        handleGenerateInvoice();
      }
    } catch (error) {
      console.error("Failed to download invoice as PDF:", error);
      toast.error("Failed to download invoice. Please try again.");
    }
  };

  const handleCaptureInvoice = async () => {
    try {
      // Find the invoice preview element
      const previewElement = document.querySelector('.invoice-preview');
      if (!previewElement) {
        throw new Error("Invoice preview not found");
      }

      toast.loading("Capturing invoice...");
      
      // Capture the preview as an image
      const result = await captureInvoiceAsImage(previewElement as HTMLElement, clientName);
      
      if (result) {
        toast.success("Invoice image captured successfully!");
        // Call the parent's handler for analytics/tracking
        handleGenerateInvoice();
      }
    } catch (error) {
      console.error("Failed to capture invoice:", error);
      toast.error("Failed to capture invoice. Please try again.");
    }
  };
  
  const handleShare = async () => {
    try {
      const result = await shareInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        swiftCode,
        accountName,
        clientName,
        selectedTemplate
      });
      
      if (result) {
        // Call the parent's handler for analytics/tracking
        handleShareInvoice();
      }
    } catch (error) {
      console.error("Failed to share invoice:", error);
      toast.error("Failed to share invoice. Please try again.");
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <Button
        onClick={handleDownloadAsPdf}
        className="text-white bg-gray-700 hover:bg-gray-800"
        disabled={!isAccountVerified}
      >
        <Download className="h-4 w-4 mr-2" />
        Download as PDF
      </Button>
      
      <Button
        onClick={handleCaptureInvoice}
        className="text-white bg-gray-700 hover:bg-gray-800"
        disabled={!isAccountVerified}
      >
        <Image className="h-4 w-4 mr-2" />
        Download as Image
      </Button>
      
      <Button
        onClick={handleShare}
        variant="outline"
        className="border-gray-300 text-gray-700 hover:bg-gray-50"
        disabled={!isAccountVerified}
      >
        <Share className="h-4 w-4 mr-2" />
        Share Invoice
      </Button>
      
      {!isAccountVerified && (
        <p className="text-sm text-red-500 mt-1">
          Please verify your account details first
        </p>
      )}
    </div>
  );
};

export default ActionButtons;
