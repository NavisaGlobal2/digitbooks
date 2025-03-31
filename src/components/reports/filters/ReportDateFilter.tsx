
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarRange } from "lucide-react";

interface ReportDateFilterProps {
  dateRange: { startDate: Date; endDate: Date } | null;
  onDateRangeChange: (range: { startDate: Date; endDate: Date } | null) => void;
}

const ReportDateFilter: React.FC<ReportDateFilterProps> = ({
  dateRange,
  onDateRangeChange,
}) => {
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [tempStartDate, setTempStartDate] = React.useState<Date | undefined>(
    dateRange?.startDate || undefined
  );
  const [tempEndDate, setTempEndDate] = React.useState<Date | undefined>(
    dateRange?.endDate || undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    // If no start date selected yet or end date is already selected, set as start date
    if (!tempStartDate || tempEndDate) {
      setTempStartDate(date);
      setTempEndDate(undefined);
      return;
    }

    // If date is before start date, make it the new start date
    if (date < tempStartDate) {
      setTempStartDate(date);
      return;
    }

    // Set as end date and apply filter
    setTempEndDate(date);
    if (tempStartDate) {
      onDateRangeChange({ startDate: tempStartDate, endDate: date });
      setDatePickerOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!tempStartDate) return "Select date range";
    if (!tempEndDate) return `${format(tempStartDate, "MMM dd, yyyy")} - Select end date`;
    return `${format(tempStartDate, "MMM dd, yyyy")} - ${format(tempEndDate, "MMM dd, yyyy")}`;
  };

  return (
    <div>
      <label className="block text-sm font-medium text-muted-foreground mb-1">Date range</label>
      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="pl-3 pr-2 text-left font-normal flex justify-between bg-white border-[#05D166]/20 hover:border-[#05D166]/50 hover:bg-[#F2FCE2]/40 transition-all"
          >
            <span className="truncate">{formatDateRange()}</span>
            <CalendarRange className="ml-2 h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={tempEndDate || tempStartDate}
            onSelect={handleDateSelect}
            initialFocus
            className="pointer-events-auto"
            disabled={(date) => {
              // Cannot select dates in the future
              return date > new Date();
            }}
          />
          <div className="p-3 border-t border-border text-xs">
            {tempStartDate ? (
              <p>
                Selected: <strong>{format(tempStartDate, "MMM dd, yyyy")}</strong>
                {tempEndDate && (
                  <>
                    {" "}
                    to <strong>{format(tempEndDate, "MMM dd, yyyy")}</strong>
                  </>
                )}
              </p>
            ) : (
              <p>Click to select a start date</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ReportDateFilter;
