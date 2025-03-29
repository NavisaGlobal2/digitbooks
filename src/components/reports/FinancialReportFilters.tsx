
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange, ReportFilters } from "@/hooks/useFinancialReports";
import { CalendarIcon, Filter, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface FinancialReportFiltersProps {
  filters: ReportFilters;
  onUpdateFilters: (filters: Partial<ReportFilters>) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const dateRangeOptions = [
  { value: "current-month", label: "Current Month" },
  { value: "last-month", label: "Last Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
  { value: "custom", label: "Custom Range" },
];

const FinancialReportFilters = ({
  filters,
  onUpdateFilters,
  onRefresh,
  isLoading,
}: FinancialReportFiltersProps) => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateRangeChange = (value: string) => {
    onUpdateFilters({ dateRange: value as DateRange });
  };

  const formatDateRange = () => {
    if (filters.dateRange === "custom" && filters.startDate && filters.endDate) {
      return `${format(filters.startDate, "MMM dd, yyyy")} - ${format(
        filters.endDate,
        "MMM dd, yyyy"
      )}`;
    }
    
    return dateRangeOptions.find(option => option.value === filters.dateRange)?.label || "Date Range";
  };

  const handleCustomDateSelect = (date: Date | undefined) => {
    if (!date) return;
    
    // If no start date selected yet, set it
    if (!filters.startDate) {
      onUpdateFilters({ startDate: date });
      return;
    }
    
    // If start date is already selected and the new date is after it, set it as end date
    if (date > filters.startDate) {
      onUpdateFilters({ endDate: date });
      setIsCalendarOpen(false);
      return;
    }
    
    // If the new date is before the existing start date, reset and use it as start date
    onUpdateFilters({ startDate: date, endDate: undefined });
  };

  return (
    <div className="flex flex-wrap gap-3 items-center mb-5">
      <Select value={filters.dateRange} onValueChange={handleDateRangeChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {filters.dateRange === "custom" && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.startDate && filters.endDate
                ? `${format(filters.startDate, "MMM dd")} - ${format(
                    filters.endDate,
                    "MMM dd"
                  )}`
                : filters.startDate
                ? `${format(filters.startDate, "MMM dd")} - Select end date`
                : "Select date range"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.endDate || filters.startDate}
              onSelect={handleCustomDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      )}

      <Button 
        variant="outline" 
        size="icon" 
        onClick={() => onRefresh()} 
        disabled={isLoading}
        className="ml-auto"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      </Button>
    </div>
  );
};

export default FinancialReportFilters;
