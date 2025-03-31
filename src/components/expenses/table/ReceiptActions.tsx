
import { Eye, Download, Trash2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Expense } from "@/types/expense";
import { toast } from "sonner";

interface ReceiptActionsProps {
  expense: Expense;
  onViewReceipt: (receiptUrl: string) => void;
  onDeleteReceipt: (expense: Expense) => void;
}

const ReceiptActions = ({ expense, onViewReceipt, onDeleteReceipt }: ReceiptActionsProps) => {
  const downloadReceipt = (receiptUrl: string, description: string) => {
    try {
      // Create an anchor element
      const a = document.createElement('a');
      a.href = receiptUrl;
      // Set the download attribute to ensure it's treated as a download
      a.download = `receipt-${description.replace(/\s+/g, '-').toLowerCase()}.png`;
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success("Receipt download started");
    } catch (error) {
      console.error("Failed to download receipt:", error);
      toast.error("Failed to download receipt");
    }
  };

  if (!expense.receiptUrl) return null;

  return (
    <>
      <DropdownMenuItem 
        className="cursor-pointer"
        onClick={() => onViewReceipt(expense.receiptUrl!)}
      >
        <Eye className="h-4 w-4 mr-2" />
        View Receipt
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        className="cursor-pointer"
        onClick={() => downloadReceipt(expense.receiptUrl!, expense.description)}
      >
        <Download className="h-4 w-4 mr-2" />
        Download Receipt
      </DropdownMenuItem>
      
      <DropdownMenuItem 
        className="cursor-pointer text-red-500 focus:text-red-500"
        onClick={() => onDeleteReceipt(expense)}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Receipt
      </DropdownMenuItem>
    </>
  );
};

export default ReceiptActions;
