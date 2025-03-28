
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useFormContext } from "react-hook-form";
import { categories, frequencies } from "./BillFormSchema";
import { BillFormValues } from "./BillFormSchema";

export const DescriptionField = () => {
  const form = useFormContext<BillFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Description</FormLabel>
          <FormControl>
            <Input placeholder="e.g. Electricity Bill" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const AmountField = () => {
  const form = useFormContext<BillFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="amount"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Amount</FormLabel>
          <FormControl>
            <Input
              placeholder="0.00"
              type="number"
              step="0.01"
              min="0"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export const CategoryField = () => {
  const form = useFormContext<BillFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="category_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
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

export const FrequencyField = () => {
  const form = useFormContext<BillFormValues>();
  
  return (
    <FormField
      control={form.control}
      name="frequency"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Payment Frequency</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {frequencies.map((frequency) => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
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

export const DateField = ({ name, label, optional = false }: { name: "start_date" | "end_date", label: string, optional?: boolean }) => {
  const form = useFormContext<BillFormValues>();
  
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}{optional && " (Optional)"}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={`w-full pl-3 text-left font-normal ${
                    !field.value && "text-muted-foreground"
                  }`}
                >
                  {field.value ? (
                    format(field.value, "PPP")
                  ) : (
                    <span>{optional ? "Set an end date" : "Pick a date"}</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value || undefined}
                onSelect={field.onChange}
                disabled={(date) =>
                  date < new Date(new Date().setHours(0, 0, 0, 0))
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
