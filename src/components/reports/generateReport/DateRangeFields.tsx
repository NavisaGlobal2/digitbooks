
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UseFormReturn, UseFormWatch } from "react-hook-form";
import { ReportFormValues } from "./ReportFormSchema";

interface DateRangeFieldsProps {
  form: UseFormReturn<ReportFormValues>;
  watch: UseFormWatch<ReportFormValues>;
}

export const DateRangeFields: React.FC<DateRangeFieldsProps> = ({ form, watch }) => {
  const selectedReportPeriod = watch("reportPeriod");
  const showCustomDateRange = selectedReportPeriod === "custom-range";

  return (
    <div className="space-y-4 border rounded-md p-4 bg-slate-50">
      <div className="text-sm font-medium">Report Date Range</div>
      <div className="grid grid-cols-2 gap-3">
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs mb-1">Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full pl-3 text-left font-normal text-xs",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "MMM dd, yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className="text-xs mb-1">End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "w-full pl-3 text-left font-normal text-xs",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "MMM dd, yyyy")
                      ) : (
                        <span>Select date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => {
                      const startDate = form.getValues("startDate");
                      return startDate ? date < startDate : false;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />
      </div>
      
      <div className="text-xs text-muted-foreground italic">
        {!showCustomDateRange && "Date range automatically set based on selected period"}
      </div>
    </div>
  );
};
