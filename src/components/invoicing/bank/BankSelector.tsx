
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Bank {
  name: string;
  code: string;
}

interface BankSelectorProps {
  banks: Bank[];
  bankName: string;
  setBankName: (value: string) => void;
  setSelectedBankCode: (value: string) => void;
  isVerified: boolean;
}

const BankSelector = ({ 
  banks,
  bankName,
  setBankName, 
  setSelectedBankCode,
  isVerified
}: BankSelectorProps) => {
  
  useEffect(() => {
    const bank = banks.find(b => b.name === bankName);
    if (bank) {
      setSelectedBankCode(bank.code);
    }
  }, [bankName, banks, setSelectedBankCode]);

  const handleBankSelection = (value: string) => {
    setBankName(value);
  };

  return (
    <div>
      <Label htmlFor="bank-name">Bank name</Label>
      <Select onValueChange={handleBankSelection} value={bankName}>
        <SelectTrigger id="bank-name" className={isVerified ? "border-green-500" : ""}>
          <SelectValue placeholder="Select a bank" />
        </SelectTrigger>
        <SelectContent className="bg-gray-100 border border-gray-200">
          {banks.map((bank) => (
            <SelectItem key={bank.code} value={bank.name}>
              {bank.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BankSelector;
