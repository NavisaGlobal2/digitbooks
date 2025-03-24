
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank transfer", label: "Bank Transfer" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "other", label: "Other" },
];

interface RevenuePaymentMethodFieldProps {
  control: Control<any>;
}

const RevenuePaymentMethodField = ({ control }: RevenuePaymentMethodFieldProps) => {
  return (
    <FormField
      control={control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Payment method</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {paymentMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default RevenuePaymentMethodField;
