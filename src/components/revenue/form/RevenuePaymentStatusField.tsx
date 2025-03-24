
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { PaymentStatus } from "@/types/revenue";

const paymentStatuses = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "overdue", label: "Overdue" },
  { value: "cancelled", label: "Cancelled" },
];

interface RevenuePaymentStatusFieldProps {
  control: Control<any>;
}

const RevenuePaymentStatusField = ({ control }: RevenuePaymentStatusFieldProps) => {
  return (
    <FormField
      control={control}
      name="paymentStatus"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Payment status</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {paymentStatuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
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

export default RevenuePaymentStatusField;
