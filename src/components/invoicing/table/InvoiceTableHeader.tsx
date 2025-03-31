
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

const InvoiceTableHeader = () => {
  return (
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
  );
};

export default InvoiceTableHeader;
