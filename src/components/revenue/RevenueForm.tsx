
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Revenue, RevenueSource } from "@/types/revenue";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const revenueSources: { value: RevenueSource; label: string }[] = [
  { value: "sales", label: "Sales" },
  { value: "services", label: "Services" },
  { value: "investments", label: "Investments" },
  { value: "grants", label: "Grants" },
  { value: "donations", label: "Donations" },
  { value: "royalties", label: "Royalties" },
  { value: "rental", label: "Rental Income" },
  { value: "consulting", label: "Consulting" },
  { value: "affiliate", label: "Affiliate" },
  { value: "other", label: "Other" },
];

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank transfer", label: "Bank Transfer" },
  { value: "crypto", label: "Cryptocurrency" },
  { value: "other", label: "Other" },
];

const formSchema = z.object({
  description: z.string().min(3, "Description must be at least 3 characters"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.date(),
  source: z.enum(["sales", "services", "investments", "grants", "donations", "royalties", "rental", "consulting", "affiliate", "other"]),
  paymentMethod: z.enum(["cash", "card", "bank transfer", "crypto", "other"]),
  clientName: z.string().optional(),
  notes: z.string().optional(),
});

type RevenueFormValues = z.infer<typeof formSchema>;

interface RevenueFormProps {
  onSubmit: (values: Omit<Revenue, "id">) => void;
  defaultValues?: Partial<Revenue>;
  isEdit?: boolean;
}

const RevenueForm = ({ onSubmit, defaultValues, isEdit = false }: RevenueFormProps) => {
  const form = useForm<RevenueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      source: defaultValues?.source || "sales",
      paymentMethod: defaultValues?.paymentMethod || "bank transfer",
      clientName: defaultValues?.clientName || "",
      notes: defaultValues?.notes || "",
    },
  });

  const handleSubmit = (values: RevenueFormValues) => {
    onSubmit({
      ...values,
      date: values.date,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Product Sale, Client Payment" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount (₦)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Revenue Source</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a revenue source" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {revenueSources.map((source) => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
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

          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client Name (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Client name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional notes about this revenue"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">
            {isEdit ? "Update Revenue" : "Save Revenue"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RevenueForm;
