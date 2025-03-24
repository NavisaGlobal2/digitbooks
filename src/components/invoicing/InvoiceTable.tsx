
import { format } from "date-fns";
import { CheckCircle, Download, ExternalLink, MoreVertical } from "lucide-react";
import { Invoice } from "@/types/invoice";
import { formatNaira } from "@/utils/invoice";
import { downloadInvoice, shareInvoice } from "@/utils/invoice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import InvoiceStatusBadge from "./InvoiceStatusBadge";

interface InvoiceTableProps {
  invoices: Invoice[];
  onMarkAsPaid: (invoiceId: string) => void;
}

const InvoiceTable = ({ invoices, onMarkAsPaid }: InvoiceTableProps) => {
  const handleDownloadInvoice = async (invoice: Invoice) => {
    await downloadInvoice({
      logoPreview: invoice.logoUrl || null,
      invoiceItems: invoice.items,
      invoiceDate: invoice.issuedDate,
      dueDate: invoice.dueDate,
      additionalInfo: invoice.additionalInfo || "",
      bankName: invoice.bankDetails.bankName,
      accountNumber: invoice.bankDetails.accountNumber,
      swiftCode: invoice.bankDetails.swiftCode,
      accountName: invoice.bankDetails.accountName,
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber
    });
  };
  
  const handleShareInvoice = async (invoice: Invoice) => {
    await shareInvoice({
      logoPreview: invoice.logoUrl || null,
      invoiceItems: invoice.items,
      invoiceDate: invoice.issuedDate,
      dueDate: invoice.dueDate,
      additionalInfo: invoice.additionalInfo || "",
      bankName: invoice.bankDetails.bankName,
      accountNumber: invoice.bankDetails.accountNumber,
      swiftCode: invoice.bankDetails.swiftCode,
      accountName: invoice.bankDetails.accountName,
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Issued date</TableHead>
            <TableHead>Due date</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.clientName}</TableCell>
              <TableCell>{format(new Date(invoice.issuedDate), "dd/MM/yyyy")}</TableCell>
              <TableCell>{format(new Date(invoice.dueDate), "dd/MM/yyyy")}</TableCell>
              <TableCell className="text-right">{formatNaira(invoice.amount)}</TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDownloadInvoice(invoice)} className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleShareInvoice(invoice)} className="cursor-pointer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    {invoice.status !== 'paid' && (
                      <DropdownMenuItem onClick={() => onMarkAsPaid(invoice.id)} className="cursor-pointer">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark as Paid
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default InvoiceTable;
