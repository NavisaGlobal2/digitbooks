
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface RevenueNotesFieldProps {
  control: Control<any>;
}

const RevenueNotesField = ({ control }: RevenueNotesFieldProps) => {
  return (
    <FormField
      control={control}
      name="notes"
      render={({ field }) => (
        <FormItem className="space-y-1">
          <FormLabel className="text-sm font-medium">Notes (optional)</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter additional notes" 
              className="resize-none min-h-[60px]" 
              {...field} 
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default RevenueNotesField;
