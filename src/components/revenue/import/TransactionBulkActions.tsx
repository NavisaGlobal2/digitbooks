
import { RevenueSource } from "@/types/revenue";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";

interface TransactionBulkActionsProps {
  selectAll: boolean;
  onSelectAllChange: (checked: boolean) => void;
  onSourceForAllChange: (source: RevenueSource) => void;
  suggestedCount: number;
  onApplySuggestions: () => void;
}

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

const TransactionBulkActions = ({
  selectAll,
  onSelectAllChange,
  onSourceForAllChange,
  suggestedCount,
  onApplySuggestions
}: TransactionBulkActionsProps) => {
  return (
    <div className="p-4 border-b flex flex-wrap items-center gap-4 bg-white">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="selectAll" 
          checked={selectAll} 
          onCheckedChange={onSelectAllChange}
        />
        <Label htmlFor="selectAll">Select All</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Label htmlFor="bulkCategory" className="whitespace-nowrap">
          Set source for selected:
        </Label>
        <Select onValueChange={(value) => onSourceForAllChange(value as RevenueSource)}>
          <SelectTrigger className="w-[180px]" id="bulkCategory">
            <SelectValue placeholder="Select source" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {REVENUE_SOURCES.map((source) => (
                <SelectItem key={source.value} value={source.value}>
                  {source.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      
      {suggestedCount > 0 && (
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-auto border-yellow-300 text-yellow-700 hover:bg-yellow-50"
          onClick={onApplySuggestions}
        >
          <Sparkles className="h-4 w-4 mr-1 text-yellow-500" />
          Apply AI suggestions ({suggestedCount})
        </Button>
      )}
    </div>
  );
};

export default TransactionBulkActions;
