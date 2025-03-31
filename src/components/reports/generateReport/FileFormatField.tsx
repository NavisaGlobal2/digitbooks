
import React from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ReportFormValues } from "./ReportFormSchema";

interface FileFormatFieldProps {
  form: UseFormReturn<ReportFormValues>;
}

export const FileFormatField: React.FC<FileFormatFieldProps> = ({ form }) => {
  return (
    <FormField
      control={form.control}
      name="fileFormat"
      render={({ field }) => (
        <FormItem>
          <FormLabel>File Format</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a file format" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="pdf">PDF Document</SelectItem>
              <SelectItem value="excel">Excel Spreadsheet</SelectItem>
              <SelectItem value="csv">CSV File</SelectItem>
            </SelectContent>
          </Select>
        </FormItem>
      )}
    />
  );
};
