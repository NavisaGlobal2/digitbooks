
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ReportFormValues } from "./ReportFormSchema";

interface ReportTypeFieldProps {
  form: UseFormReturn<ReportFormValues>;
}

export const ReportTypeField: React.FC<ReportTypeFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="reportType"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Report Type</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a report type" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="income-statement">Income Statement</SelectItem>
              <SelectItem value="cash-flow">Cash Flow Statement</SelectItem>
              <SelectItem value="expense-summary">Expense Summary</SelectItem>
              <SelectItem value="revenue-summary">Revenue Summary</SelectItem>
              <SelectItem value="budget-analysis">Budget Analysis</SelectItem>
              <SelectItem value="profit-loss">Profit & Loss</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};
