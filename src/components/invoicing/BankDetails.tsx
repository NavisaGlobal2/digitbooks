
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
          <Label htmlFor="account-name">Your account name</Label>
          <Input 
            id="account-name" 
            placeholder="Input details" 
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="account-number">Account number</Label>
            <Input 
              id="account-number" 
              placeholder="Input details" 
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="bank-name">Bank name</Label>
            <Input 
              id="bank-name" 
              placeholder="Input details" 
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bank-address">Bank address</Label>
            <Input 
              id="bank-address" 
              placeholder="Input details" 
              value={bankAddress}
              onChange={(e) => setBankAddress(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="swift-code">Swift code</Label>
            <Input 
              id="swift-code" 
              placeholder="Input details" 
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
