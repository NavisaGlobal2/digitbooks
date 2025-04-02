
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";

interface RevenueAmountFieldProps {
  control: Control<any>;
}

const RevenueAmountField = ({ control }: RevenueAmountFieldProps) => {
  return (
    <FormField
      control={control}
      name="amount"
      render={({ field: { onChange, ...field } }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Amount</FormLabel>
          <FormControl>
            <Input 
              type="number" 
              step="0.01" 
              placeholder="Enter amount" 
              className="h-9" 
              onChange={(e) => onChange(Number(e.target.value))}
              {...field} 
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};

export default RevenueAmountField;
