import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/utils/invoice/formatters";
import { LucideIcon } from "lucide-react";
import { TransactionFrequency } from "@/types/recurringTransaction";

interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  category: string;
  icon: LucideIcon;
  daysLeft: number;
  frequency: TransactionFrequency;
}

interface BillsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bills: Bill[];
  onPayBill: (billId: string, billTitle: string, amount: number, frequency: TransactionFrequency) => void;
}

const BillsDialog = ({ open, onOpenChange, bills, onPayBill }: BillsDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>All Upcoming Bills</DialogTitle>
        </DialogHeader>
        {bills.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Due In</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill) => (
                  <TableRow key={bill.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <bill.icon className="h-4 w-4 text-purple-600" />
                        </div>
                        <span className="font-medium">{bill.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{bill.category}</TableCell>
                    <TableCell>{bill.dueDate}</TableCell>
                    <TableCell>
                      {bill.daysLeft > 0 ? `${bill.daysLeft} days` : 'Due today'}
                    </TableCell>
                    <TableCell className="text-right font-medium break-words">{formatNaira(bill.amount)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-green-500 hover:bg-green-50"
                        onClick={() => onPayBill(bill.id, bill.title, bill.amount, bill.frequency)}
                      >
                        Pay bill
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No bills found matching your search criteria.</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BillsDialog;
