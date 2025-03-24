
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface RevenueClientNameFieldProps {
  control: Control<any>;
}

const RevenueClientNameField = ({ control }: RevenueClientNameFieldProps) => {
  return (
    <FormField
      control={control}
      name="clientName"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Client name (optional)</FormLabel>
          <FormControl>
            <Input 
              placeholder="Enter client name" 
              className="h-12" 
              {...field} 
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RevenueClientNameField;
