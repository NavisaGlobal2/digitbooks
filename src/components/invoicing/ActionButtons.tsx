
import { useState } from 'react';
import { Download, Share } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { InvoiceItem } from '@/types/invoice';
import { downloadInvoice, shareInvoice, captureInvoiceAsImage } from '@/utils/invoice/documentActions';

interface ActionButtonsProps {
  logoPreview: string | null;
  invoiceItems: InvoiceItem[];
  invoiceDate?: Date;
  dueDate?: Date;
  additionalInfo: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  selectedTemplate: string;
  invoiceNumber?: string;
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
  clientEmail,
  clientAddress,
  selectedTemplate,
  invoiceNumber
}: ActionButtonsProps) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
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
        clientEmail,
        clientAddress,
        selectedTemplate,
        invoiceNumber
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);
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
        clientEmail,
        clientAddress,
        selectedTemplate,
        invoiceNumber
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
      toast.error('Failed to share invoice');
    } finally {
      setIsSharing(false);
    }
  };

  const handleCaptureAsImage = async () => {
    const invoiceElement = document.querySelector('.invoice-preview');
    if (invoiceElement) {
      const success = await captureInvoiceAsImage(invoiceElement as HTMLElement, clientName);
      if (success) {
        toast.success('Invoice captured and downloaded as image');
      }
    } else {
      toast.error('Invoice preview not found');
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        variant="outline"
        className="flex-1"
        onClick={handleDownload}
        disabled={isDownloading}
      >
        <Download className="h-4 w-4 mr-2" />
        {isDownloading ? 'Downloading...' : 'Download PDF'}
      </Button>
      
      <Button
        variant="outline"
        className="flex-1"
        onClick={handleShare}
        disabled={isSharing}
      >
        <Share className="h-4 w-4 mr-2" />
        {isSharing ? 'Sharing...' : 'Share Invoice'}
      </Button>
      
      <Button
        variant="outline"
        className="flex-1"
        onClick={handleCaptureAsImage}
      >
        <Download className="h-4 w-4 mr-2" />
        Download as Image
      </Button>
    </div>
  );
};

export default ActionButtons;
