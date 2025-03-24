
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
    // When bank name changes, find the corresponding code
    const bank = banks.find(b => b.name === bankName);
    if (bank) {
      setSelectedBankCode(bank.code);
    } else if (banks.length > 0 && !bankName) {
      // Auto-select the first bank if none is selected
      setBankName(banks[0].name);
      setSelectedBankCode(banks[0].code);
    }
  }, [bankName, banks, setBankName, setSelectedBankCode]);

  const handleBankSelection = (value: string) => {
    setBankName(value);
    // Find and set the bank code when selection changes
    const selectedBank = banks.find(bank => bank.name === value);
    if (selectedBank) {
      setSelectedBankCode(selectedBank.code);
    }
  };

  return (
    <div>
      <Label htmlFor="bank-name">Bank name</Label>
      <Select onValueChange={handleBankSelection} value={bankName} disabled={isLoading || isVerified}>
        <SelectTrigger 
          id="bank-name" 
          className={isVerified ? "border-green-500" : ""}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading banks...</span>
            </div>
          ) : (
            <SelectValue placeholder="Select a bank" />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {banks.length === 0 && !isLoading ? (
            <div className="p-2 text-center text-gray-500">No banks available</div>
          ) : (
            banks.map((bank) => (
              <SelectItem 
                key={bank.code} 
                value={bank.name}
              >
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
