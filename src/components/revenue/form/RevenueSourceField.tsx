
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { RevenueSource } from "@/types/revenue";

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

interface RevenueSourceFieldProps {
  control: Control<any>;
}

const RevenueSourceField = ({ control }: RevenueSourceFieldProps) => {
  return (
    <FormField
      control={control}
      name="source"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">Revenue source</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="w-full h-12">
                <SelectValue placeholder="Input details" />
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
  );
};

export default RevenueSourceField;
