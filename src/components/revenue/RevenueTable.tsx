
import { format } from "date-fns";
import { MoreVertical, Download } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Revenue, PaymentStatus } from "@/types/revenue";
import { formatNaira } from "@/utils/invoice";

interface RevenueTableProps {
  revenues: Revenue[];
  onUpdateStatus: (id: string, status: PaymentStatus) => void;
  onDelete: (id: string) => void;
}

export const RevenueTable = ({ revenues, onUpdateStatus, onDelete }: RevenueTableProps) => {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "paid":
        return <Badge variant="success">Paid</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "overdue":
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Revenue #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => (
            <TableRow key={revenue.id}>
              <TableCell className="font-medium">{revenue.id.substring(0, 8)}</TableCell>
              <TableCell>{format(new Date(revenue.date), "dd/MM/yyyy")}</TableCell>
              <TableCell className="capitalize">{revenue.source}</TableCell>
              <TableCell>{revenue.description}</TableCell>
              <TableCell className="text-right">{formatNaira(revenue.amount)}</TableCell>
              <TableCell>{getStatusBadge(revenue.paymentStatus)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(revenue.id, "paid")}
                      disabled={revenue.paymentStatus === "paid"}
                    >
                      Mark as Paid
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(revenue.id, "pending")}
                      disabled={revenue.paymentStatus === "pending"}
                    >
                      Mark as Pending
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onUpdateStatus(revenue.id, "overdue")}
                      disabled={revenue.paymentStatus === "overdue"}
                    >
                      Mark as Overdue
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete(revenue.id)}
                    >
                      Delete
                    </DropdownMenuItem>
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
