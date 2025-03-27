
import { FileText, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExpenseDescriptionProps {
  description: string;
  fromStatement?: boolean;
  receiptUrl?: string;
  onViewReceipt: (receiptUrl: string) => void;
}

const ExpenseDescription = ({ 
  description, 
  fromStatement, 
  receiptUrl, 
  onViewReceipt 
}: ExpenseDescriptionProps) => {
  return (
    <div className="flex items-center gap-2">
      {fromStatement && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <FileText className="h-4 w-4 text-green-500 flex-shrink-0" />
            </TooltipTrigger>
            <TooltipContent>
              <p>From bank statement</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {receiptUrl && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0"
                onClick={() => onViewReceipt(receiptUrl)}
              >
                <Eye className="h-3 w-3 text-blue-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View receipt</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <span className="truncate">{description}</span>
    </div>
  );
};

export default ExpenseDescription;
