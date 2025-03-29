
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
  const [isCapturing, setIsCapturing] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return; // Prevent multiple clicks
    
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
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return; // Prevent multiple clicks
    
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
    } finally {
      setIsSharing(false);
    }
  };

  const handleCaptureAsImage = async () => {
    if (isCapturing) return; // Prevent multiple clicks
    
    setIsCapturing(true);
    
    const invoiceElement = document.querySelector('.invoice-preview');
    if (invoiceElement) {
      try {
        await captureInvoiceAsImage(invoiceElement as HTMLElement, clientName);
      } catch (error) {
        console.error('Error capturing invoice as image:', error);
      } finally {
        setIsCapturing(false);
      }
    } else {
      toast.error('Invoice preview not found');
      setIsCapturing(false);
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
        disabled={isCapturing}
      >
        <Download className="h-4 w-4 mr-2" />
        {isCapturing ? 'Downloading...' : 'Download as Image'}
      </Button>
    </div>
  );
};

export default ActionButtons;
