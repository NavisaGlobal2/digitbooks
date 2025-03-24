
import { format } from "date-fns";
import { MoreVertical, FileEdit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Revenue, PaymentStatus } from "@/types/revenue";
import { formatNaira } from "@/utils/invoice";
import { Badge } from "@/components/ui/badge";

interface RevenueTableProps {
  revenues: Revenue[];
  onDeleteRevenue: (id: string) => void;
  onEditRevenue: (id: string) => void;
}

const RevenueTable = ({ revenues, onDeleteRevenue, onEditRevenue }: RevenueTableProps) => {
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusStyles = {
      paid: "bg-green-100 text-green-800 hover:bg-green-100",
      pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
      overdue: "bg-red-100 text-red-800 hover:bg-red-100",
      cancelled: "bg-gray-100 text-gray-800 hover:bg-gray-100"
    };
    
    return (
      <Badge className={`${statusStyles[status]} capitalize`} variant="outline">
        {status}
      </Badge>
    );
  };
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {revenues.map((revenue) => (
            <TableRow key={revenue.id}>
              <TableCell>{format(new Date(revenue.date), "dd/MM/yyyy")}</TableCell>
              <TableCell className="font-medium">{revenue.description}</TableCell>
              <TableCell className="capitalize">{revenue.source}</TableCell>
              <TableCell>{revenue.clientName || "-"}</TableCell>
              <TableCell>{getPaymentStatusBadge(revenue.paymentStatus)}</TableCell>
              <TableCell className="text-right">{formatNaira(revenue.amount)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => onEditRevenue(revenue.id)}
                    >
                      <FileEdit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-500 focus:text-red-500"
                      onClick={() => onDeleteRevenue(revenue.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
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

export default RevenueTable;
