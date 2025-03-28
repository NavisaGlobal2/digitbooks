
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";

const paymentMethodSchema = z.object({
  method: z.enum(["bank_transfer", "cash", "card", "mobile_money"]),
  reference: z.string().optional(),
});

export type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  onSubmit: (values: PaymentMethodForm) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

const PaymentMethodForm = ({ onSubmit, isSubmitting, onCancel }: PaymentMethodFormProps) => {
  const form = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method: "bank_transfer",
      reference: "",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile_money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="reference"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="Payment reference" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter className="pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Confirm Payment"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default PaymentMethodForm;
