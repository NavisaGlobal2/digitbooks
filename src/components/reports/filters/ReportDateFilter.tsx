
import React, { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportDateFilterProps {
  dateRange: { startDate: Date; endDate: Date } | null;
  onChange: (range: { startDate: Date; endDate: Date } | null) => void;
  onGenerateReport?: () => void;
}

const ReportDateFilter: React.FC<ReportDateFilterProps> = ({
  dateRange,
  onChange,
  onGenerateReport
}) => {
  const [date, setDate] = useState<DateRange | undefined>(
    dateRange
      ? { from: dateRange.startDate, to: dateRange.endDate }
      : undefined
  );

  // Update local state when the dateRange prop changes
  useEffect(() => {
    if (dateRange) {
      setDate({ from: dateRange.startDate, to: dateRange.endDate });
    } else {
      setDate(undefined);
    }
  }, [dateRange]);

  const handleSelect = (range: DateRange | undefined) => {
    setDate(range);
    
    if (range?.from && range?.to) {
      onChange({
        startDate: range.from,
        endDate: range.to
      });
    } else if (range?.from) {
      onChange({
        startDate: range.from,
        endDate: range.from
      });
    } else {
      onChange(null);
    }
  };

  const displayDateRange = dateRange ? 
    `${format(dateRange.startDate, "MMM dd, yyyy")} - ${format(dateRange.endDate, "MMM dd, yyyy")}` : 
    "Select date range";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayDateRange}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
            className="p-3"
          />
        </PopoverContent>
      </Popover>
      
      {date?.from && date?.to && onGenerateReport && (
        <Button 
          onClick={onGenerateReport} 
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      )}
    </div>
  );
};

export default ReportDateFilter;
