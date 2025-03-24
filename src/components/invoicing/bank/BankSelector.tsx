
import { useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";

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
  isLoading?: boolean;
}

const BankSelector = ({ 
  banks,
  bankName,
  setBankName, 
  setSelectedBankCode,
  isVerified,
  isLoading = false
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
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading banks...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a bank" />
          )}
        </SelectTrigger>
        <SelectContent className="bg-gray-100 border border-gray-200 max-h-[300px]">
          {banks.length === 0 && !isLoading ? (
            <div className="p-2 text-center text-gray-500">No banks available</div>
          ) : (
            banks.map((bank) => (
              <SelectItem key={bank.code} value={bank.name}>
                {bank.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BankSelector;
