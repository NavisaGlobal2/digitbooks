
import { CheckCircle, Download, ExternalLink, MoreVertical, Receipt } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface InvoiceActionMenuProps {
  invoice: Invoice;
  onDownload: (invoice: Invoice) => void;
  onShare: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  isProcessingPayment: boolean;
}

const InvoiceActionMenu = ({ 
  invoice, 
  onDownload, 
  onShare, 
  onMarkAsPaid, 
  isProcessingPayment 
}: InvoiceActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => onDownload(invoice)} 
          className="cursor-pointer"
          disabled={isProcessingPayment}
        >
          {invoice.status === 'paid' || invoice.status === 'partially-paid' ? (
            <>
              <Receipt className="h-4 w-4 mr-2" />
              Download Receipt
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Download Invoice
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onShare(invoice)} 
          className="cursor-pointer"
          disabled={isProcessingPayment}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Share
        </DropdownMenuItem>
        {(invoice.status === 'pending' || invoice.status === 'partially-paid') && (
          <DropdownMenuItem 
            onClick={() => onMarkAsPaid(invoice.id)} 
            className="cursor-pointer"
            disabled={isProcessingPayment}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {invoice.status === 'partially-paid' ? 'Update Payment' : 'Mark as Paid'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceActionMenu;
