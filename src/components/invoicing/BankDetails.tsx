
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface BankDetailsProps {
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
}

const BankDetails = ({ 
  accountName, setAccountName,
  accountNumber, setAccountNumber,
  bankName, setBankName,
  bankAddress, setBankAddress,
  swiftCode, setSwiftCode
}: BankDetailsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Issuer bank details</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="account-name">Account name</Label>
          <Input 
            id="account-name" 
            placeholder="Enter account holder name" 
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
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
            />
          </div>
          <div>
            <Label htmlFor="bank-name">Bank name</Label>
            <Input 
              id="bank-name" 
              placeholder="Enter bank name" 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
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
      </div>
    </div>
  );
};

export default BankDetails;
