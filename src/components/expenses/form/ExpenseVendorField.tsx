
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ExpenseVendorFieldProps {
  vendor: string;
  setVendor: (value: string) => void;
}

const ExpenseVendorField = ({ vendor, setVendor }: ExpenseVendorFieldProps) => {
  return (
    <div>
      <Label htmlFor="vendor">Vendor/Merchant</Label>
      <Input
        id="vendor"
        value={vendor}
        onChange={(e) => setVendor(e.target.value)}
        placeholder="Enter vendor name"
      />
    </div>
  );
};

export default ExpenseVendorField;
