
import React from 'react';
import { Download, Share, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoiceItem } from "@/types/invoice";
import { downloadInvoice, captureInvoice, shareInvoice } from "@/utils/invoice/documentActions";
import { toast } from "sonner";

interface ActionButtonsProps {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate: Date | undefined;
  dueDate: Date | undefined;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  clientName: string;
  clientAddress?: string;
  selectedTemplate: string;
}

const ActionButtons = ({
  logoPreview,
  invoiceItems,
  invoiceDate,
  dueDate,
  additionalInfo,
  bankName,
  accountNumber,
  accountName,
  clientName,
  clientAddress,
  selectedTemplate
}: ActionButtonsProps) => {
  
  const handleDownload = async () => {
    try {
      await downloadInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        accountName,
        clientName,
        clientAddress,
        selectedTemplate,
        invoiceNumber: "INV-2023-001"
      });
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  const handleShare = async () => {
    try {
      await shareInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        accountName,
        clientName,
        clientAddress,
        selectedTemplate,
        invoiceNumber: "INV-2023-001"
      });
      toast.success("Invoice ready to share!");
    } catch (error) {
      console.error("Error sharing invoice:", error);
      toast.error("Failed to prepare invoice for sharing");
    }
  };

  const handleCapture = async () => {
    try {
      await captureInvoice({
        logoPreview,
        invoiceItems,
        invoiceDate,
        dueDate,
        additionalInfo,
        bankName,
        accountNumber,
        accountName,
        clientName,
        clientAddress,
        selectedTemplate,
        invoiceNumber: "INV-2023-001"
      });
      toast.success("Invoice saved as image!");
    } catch (error) {
      console.error("Error capturing invoice:", error);
      toast.error("Failed to save invoice as image");
    }
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button variant="outline" className="w-full" onClick={handleDownload}>
        <Download className="h-4 w-4 mr-2" />
        Download
      </Button>
      <Button variant="outline" className="w-full" onClick={handleShare}>
        <Share className="h-4 w-4 mr-2" />
        Share
      </Button>
      <Button variant="outline" className="w-full" onClick={handleCapture}>
        <FileText className="h-4 w-4 mr-2" />
        Save as Image
      </Button>
    </div>
  );
};

export default ActionButtons;
