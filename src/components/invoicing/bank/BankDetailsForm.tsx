
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchBanks } from "@/utils/paystackService";
import AccountNameInput from "./AccountNameInput";
import AccountNumberInput from "./AccountNumberInput";
import BankSelector from "./BankSelector";
import AccountVerifier from "./AccountVerifier";

interface BankDetailsFormProps {
  accountName: string;
  setAccountName: (value: string) => void;
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  bankName: string;
  setBankName: (value: string) => void;
  bankAddress: string;
  setBankAddress: (value: string) => void;
  swiftCode: string;
  setSwiftCode: (value: string) => void;
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

interface Bank {
  name: string;
  code: string;
}

const BankDetailsForm = ({
  accountName, setAccountName,
  accountNumber, setAccountNumber,
  bankName, setBankName,
  bankAddress, setBankAddress,
  swiftCode, setSwiftCode,
  isVerified, setIsVerified
}: BankDetailsFormProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  
  useEffect(() => {
    const loadBanks = async () => {
      const banksList = await fetchBanks();
      setBanks(banksList);
    };
    
    loadBanks();
  }, []);

  return (
    <div className="space-y-4">
      <AccountNameInput 
        accountName={accountName} 
        setAccountName={setAccountName} 
        isVerified={isVerified} 
        setIsVerified={setIsVerified} 
      />
      
      <div className="grid grid-cols-2 gap-4">
        <AccountNumberInput 
          accountNumber={accountNumber} 
          setAccountNumber={setAccountNumber} 
          isVerified={isVerified} 
        />
        <BankSelector 
          banks={banks} 
          bankName={bankName} 
          setBankName={setBankName} 
          setSelectedBankCode={setSelectedBankCode}
          isVerified={isVerified} 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="bank-address">Bank branch</Label>
          <Input 
            id="bank-address" 
            placeholder="Enter bank branch" 
            value={bankAddress}
            onChange={(e) => setBankAddress(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="swift-code">Sort code (optional)</Label>
          <Input 
            id="swift-code" 
            placeholder="Bank sort code" 
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
          />
        </div>
      </div>

      <AccountVerifier 
        accountNumber={accountNumber}
        selectedBankCode={selectedBankCode}
        setAccountName={setAccountName}
        isVerified={isVerified}
        setIsVerified={setIsVerified}
      />
    </div>
  );
};

export default BankDetailsForm;
