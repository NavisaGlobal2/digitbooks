
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ReportFormValues } from "./ReportFormSchema";

interface ReportPeriodFieldProps {
  form: UseFormReturn<ReportFormValues>;
}

export const ReportPeriodField: React.FC<ReportPeriodFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="reportPeriod"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-1">
            Time Period
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Select a predefined period or choose "Custom Range" to specify exact dates</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a time period" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="current-month">Current Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="current-quarter">Current Quarter</SelectItem>
              <SelectItem value="year-to-date">Year To Date</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
              <SelectItem value="custom-range">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};
