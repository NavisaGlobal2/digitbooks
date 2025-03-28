
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addDays, addMonths, addQuarters, addWeeks, addYears, format } from "date-fns";
import { formatNaira } from "@/utils/invoice/formatters";
import { TransactionFrequency } from "@/types/recurringTransaction";

const paymentMethodSchema = z.object({
  method: z.enum(["bank_transfer", "cash", "card", "mobile_money"]),
  reference: z.string().optional(),
});

type PaymentMethodForm = z.infer<typeof paymentMethodSchema>;

interface BillPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billId: string;
  billTitle: string;
  amount: number;
  frequency: TransactionFrequency;
  onPaymentSuccess: () => void;
}

const BillPaymentDialog = ({ 
  open, 
  onOpenChange, 
  billId, 
  billTitle, 
  amount, 
  frequency,
  onPaymentSuccess 
}: BillPaymentDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<PaymentMethodForm>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      method: "bank_transfer",
      reference: "",
    },
  });

  const calculateNextDate = (currentDate: Date, frequency: TransactionFrequency): Date => {
    switch (frequency) {
      case "daily":
        return addDays(currentDate, 1);
      case "weekly":
        return addWeeks(currentDate, 1);
      case "monthly":
        return addMonths(currentDate, 1);
      case "quarterly":
        return addQuarters(currentDate, 1);
      case "annually":
        return addYears(currentDate, 1);
      default:
        return addMonths(currentDate, 1); // Default to monthly
    }
  };

  const onSubmit = async (values: PaymentMethodForm) => {
    setIsSubmitting(true);
    
    try {
      // Get the current transaction details
      const { data: transactionData, error: fetchError } = await supabase
        .from("recurring_transactions")
        .select("*")
        .eq("id", billId)
        .single();
      
      if (fetchError || !transactionData) {
        throw new Error("Failed to fetch bill details");
      }
      
      // Calculate the next due date
      const currentDueDate = new Date(transactionData.next_due_date);
      const nextDueDate = calculateNextDate(currentDueDate, frequency);
      
      // Create a transaction record for the payment
      const { error: expenseError } = await supabase
        .from("expenses")
        .insert({
          description: `Payment for ${billTitle}`,
          amount: amount,
          date: new Date().toISOString(),
          category: transactionData.category_id,
          status: "paid",
          payment_method: values.method,
          vendor: billTitle,
          notes: values.reference ? `Reference: ${values.reference}` : "Bill payment",
          user_id: transactionData.user_id,
        });
      
      if (expenseError) {
        throw expenseError;
      }
      
      // Update the recurring transaction with the new next_due_date
      const { error: updateError } = await supabase
        .from("recurring_transactions")
        .update({
          next_due_date: nextDueDate.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", billId);
      
      if (updateError) {
        throw updateError;
      }
      
      toast.success("Bill marked as paid");
      form.reset();
      onPaymentSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Failed to process payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pay Bill: {billTitle}</DialogTitle>
          <DialogDescription>
            Record payment for this bill. Amount: {formatNaira(amount)}
          </DialogDescription>
        </DialogHeader>
        
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
                onClick={() => onOpenChange(false)}
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
      </DialogContent>
    </Dialog>
  );
};

export default BillPaymentDialog;
