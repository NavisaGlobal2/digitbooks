
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

interface AccountNameInputProps {
  accountName: string;
  setAccountName: (value: string) => void;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

const AccountNameInput = ({ 
  accountName, 
  setAccountName, 
  isVerified, 
  setIsVerified 
}: AccountNameInputProps) => {
  return (
    <div>
      <Label htmlFor="account-name">Account name</Label>
      <div className="flex items-center gap-2">
        <Input 
          id="account-name" 
          placeholder="Enter account holder name or verify to auto-fill" 
          value={accountName}
          onChange={(e) => {
            setAccountName(e.target.value);
            setIsVerified(false);
          }}
          className={isVerified ? "border-green-500" : ""}
          readOnly={isVerified}
        />
        {isVerified && <Check className="text-green-500 h-5 w-5" />}
      </div>
    </div>
  );
};

export default AccountNameInput;
