
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";

interface RevenueDescriptionFieldProps {
  control: Control<any>;
}

const RevenueDescriptionField = ({ control }: RevenueDescriptionFieldProps) => {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Description</FormLabel>
          <FormControl>
            <Textarea 
              placeholder="Enter description" 
              className="resize-none min-h-[100px]" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RevenueDescriptionField;
