
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Check, Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>(banks);
  
  // Update filtered banks when search query or banks list changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBanks(banks);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredBanks(
        banks.filter(bank => bank.name.toLowerCase().includes(query))
      );
    }
  }, [searchQuery, banks]);
  
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
    setSearchQuery("");
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor="bank-name">Bank name</Label>
      <div className="relative">
        <Select 
          onValueChange={handleBankSelection} 
          value={bankName} 
          disabled={isLoading || isVerified}
          open={open}
          onOpenChange={setOpen}
        >
          <SelectTrigger 
            id="bank-name" 
            className={`${isVerified ? "border-green-500 pr-10" : ""}`}
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
          <SelectContent className="p-0">
            <div className="sticky top-0 bg-white z-10 p-2 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search banks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
            </div>
            <ScrollArea className="max-h-[300px]">
              {filteredBanks.length === 0 && !isLoading ? (
                <div className="p-2 text-center text-muted-foreground">
                  {searchQuery ? "No banks match your search" : "No banks available"}
                </div>
              ) : (
                filteredBanks.map((bank) => (
                  <SelectItem 
                    key={bank.code} 
                    value={bank.name}
                  >
                    {bank.name}
                  </SelectItem>
                ))
              )}
            </ScrollArea>
          </SelectContent>
        </Select>
        {isVerified && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
            <Check className="h-4 w-4" />
          </div>
        )}
      </div>
      {isVerified && (
        <p className="text-xs text-green-600">Bank verified</p>
      )}
    </div>
  );
};

export default BankSelector;
