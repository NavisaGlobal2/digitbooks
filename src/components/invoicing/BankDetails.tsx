
import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Loader2 } from "lucide-react";
import { fetchBanks, verifyBankAccount } from "@/utils/paystackService";
import { toast } from "sonner";

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
  isVerified: boolean;
  setIsVerified: (value: boolean) => void;
}

interface Bank {
  name: string;
  code: string;
}

const BankDetails = ({ 
  accountName, setAccountName,
  accountNumber, setAccountNumber,
  bankName, setBankName,
  bankAddress, setBankAddress,
  swiftCode, setSwiftCode,
  isVerified, setIsVerified
}: BankDetailsProps) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [selectedBankCode, setSelectedBankCode] = useState<string>("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const loadBanks = async () => {
      const banksList = await fetchBanks();
      setBanks(banksList);
    };
    
    loadBanks();
  }, []);

  useEffect(() => {
    // Find the bank code when bankName changes
    const bank = banks.find(b => b.name === bankName);
    if (bank) {
      setSelectedBankCode(bank.code);
    }
  }, [bankName, banks]);

  const handleBankSelection = (value: string) => {
    setBankName(value);
    setIsVerified(false);
  };

  const handleVerify = async () => {
    if (!accountNumber || accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit NUBAN account number");
      return;
    }

    if (!selectedBankCode) {
      toast.error("Please select a bank first");
      return;
    }

    setIsVerifying(true);
    setVerificationMessage("");

    try {
      const result = await verifyBankAccount(accountNumber, selectedBankCode);
      
      if (result.verified && result.accountName) {
        setAccountName(result.accountName);
        setIsVerified(true);
        toast.success(result.message || "Account verified successfully");
      } else {
        setIsVerified(false);
        toast.error(result.message || "Verification failed");
      }
      
      setVerificationMessage(result.message || "");
    } catch (error) {
      setIsVerified(false);
      toast.error("An error occurred during verification");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Issuer bank details</h3>
      
      <div className="space-y-4">
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
                setIsVerified(false);
              }}
              className={isVerified ? "border-green-500" : ""}
            />
          </div>
          <div>
            <Label htmlFor="bank-name">Bank name</Label>
            <Select onValueChange={handleBankSelection} value={bankName}>
              <SelectTrigger id="bank-name" className={isVerified ? "border-green-500" : ""}>
                <SelectValue placeholder="Select a bank" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank.code} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

        <div>
          <Button 
            onClick={handleVerify} 
            disabled={isVerifying || !accountNumber || !selectedBankCode || accountNumber.length !== 10}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isVerifying ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : isVerified ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Verified
              </>
            ) : (
              "Verify Account"
            )}
          </Button>
          {verificationMessage && (
            <p className={`mt-2 text-sm ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
              {verificationMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankDetails;
