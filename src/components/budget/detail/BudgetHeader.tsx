
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash } from "lucide-react";
import { format } from "date-fns";
import { Budget } from "@/contexts/BudgetContext";

interface BudgetHeaderProps {
  budget: Budget;
  onBack: () => void;
  onDelete: () => void;
}

const BudgetHeader = ({ budget, onBack, onDelete }: BudgetHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            className="text-red-500 border-red-500 hover:bg-red-50"
            onClick={onDelete}
          >
            <Trash className="h-4 w-4 mr-1" />
            <span className="hidden xs:inline">Delete</span>
          </Button>
        </div>
      </div>
      
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">{budget.name}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {format(new Date(budget.startDate), "MMM d, yyyy")} - {format(new Date(budget.endDate), "MMM d, yyyy")}
        </p>
      </div>
    </>
  );
};

export default BudgetHeader;
