
import { RevenueSource } from "@/types/revenue";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

const REVENUE_SOURCES = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "investments", label: "Investments" },
  { value: "grants", label: "Grants" },
  { value: "donations", label: "Donations" },
  { value: "royalties", label: "Royalties" },
  { value: "rental", label: "Rental" },
  { value: "consulting", label: "Consulting" },
  { value: "affiliate", label: "Affiliate" },
  { value: "other", label: "Other" },
];

interface TransactionBulkActionsProps {
  selectAll: boolean;
  onSelectAllChange: (checked: boolean) => void;
  onSourceForAllChange: (source: RevenueSource) => void;
  suggestedCount: number;
  onApplySuggestions: () => void;
}

const TransactionBulkActions = ({
  selectAll,
  onSelectAllChange,
  onSourceForAllChange,
  suggestedCount,
  onApplySuggestions
}: TransactionBulkActionsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 border-y items-center">
      <div className="flex items-center gap-2">
        <Checkbox 
          id="select-all" 
          checked={selectAll} 
          onCheckedChange={onSelectAllChange} 
        />
        <label htmlFor="select-all" className="text-sm font-medium">
          Select all income transactions
        </label>
      </div>
      
      <div className="flex items-center gap-2 ml-auto">
        <Select onValueChange={onSourceForAllChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Apply source to all" />
          </SelectTrigger>
          <SelectContent>
            {REVENUE_SOURCES.map((source) => (
              <SelectItem key={source.value} value={source.value}>
                {source.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {suggestedCount > 0 && (
          <Button 
            variant="outline" 
            className="flex items-center gap-1"
            onClick={onApplySuggestions}
          >
            <Sparkles className="h-4 w-4" />
            <span>Apply {suggestedCount} suggestion{suggestedCount !== 1 ? 's' : ''}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default TransactionBulkActions;
