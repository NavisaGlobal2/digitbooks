
import { format } from "date-fns";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice/formatters";
import { TableCell, TableRow } from "@/components/ui/table";
import InvoiceStatusBadge from "../InvoiceStatusBadge";
import InvoiceActionMenu from "./InvoiceActionMenu";

interface InvoiceRowProps {
  invoice: Invoice;
  onDownload: (invoice: Invoice) => void;
  onShare: (invoice: Invoice) => void;
  onMarkAsPaid: (invoiceId: string) => void;
  isProcessingPayment: boolean;
}

const InvoiceRow = ({ 
  invoice, 
  onDownload, 
  onShare, 
  onMarkAsPaid,
  isProcessingPayment 
}: InvoiceRowProps) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
      <TableCell>{invoice.clientName}</TableCell>
      <TableCell>{format(new Date(invoice.issuedDate), "dd/MM/yyyy")}</TableCell>
      <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
      <TableCell className="text-right">{formatNaira(invoice.amount)}</TableCell>
      <TableCell>
        <InvoiceStatusBadge status={invoice.status} />
      </TableCell>
      <TableCell>
        <InvoiceActionMenu
          invoice={invoice}
          onDownload={onDownload}
          onShare={onShare}
          onMarkAsPaid={onMarkAsPaid}
          isProcessingPayment={isProcessingPayment}
        />
      </TableCell>
    </TableRow>
  );
};

export default InvoiceRow;
