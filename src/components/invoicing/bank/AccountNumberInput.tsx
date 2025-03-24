
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AccountNumberInputProps {
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  isVerified: boolean;
}

const AccountNumberInput = ({ 
  accountNumber, 
  setAccountNumber, 
  isVerified 
}: AccountNumberInputProps) => {
  return (
    <div>
      <Label htmlFor="account-number">NUBAN account number</Label>
      <Input 
        id="account-number" 
        placeholder="10-digit NUBAN number" 
        maxLength={10}
        value={accountNumber}
        onChange={(e) => {
          // Only allow numeric input
          const value = e.target.value.replace(/\D/g, '');
          setAccountNumber(value);
        }}
        className={isVerified ? "border-green-500" : ""}
      />
    </div>
  );
};

export default AccountNumberInput;
