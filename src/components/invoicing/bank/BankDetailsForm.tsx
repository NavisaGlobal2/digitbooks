
import { useState, useEffect } from "react";
import { fetchBanks, verifyBankAccount } from "@/utils/paystackService";
import BankSelector from "./BankSelector";
import AccountVerifier from "./AccountVerifier";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Check } from "lucide-react";

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

const BankDetailsForm = ({
  accountName, setAccountName,
  accountNumber, setAccountNumber,
  bankName, setBankName,
  bankAddress, setBankAddress,
  swiftCode, setSwiftCode,
  isVerified, setIsVerified
}: BankDetailsFormProps) => {
  const [banks, setBanks] = useState<Array<{ name: string; code: string }>>([]);
  const [selectedBankCode, setSelectedBankCode] = useState("");
  const [isLoadingBanks, setIsLoadingBanks] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Fetch banks on component mount
  useEffect(() => {
    const loadBanks = async () => {
      setIsLoadingBanks(true);
      try {
        const banksList = await fetchBanks();
        console.log("Fetched banks:", banksList);
        setBanks(banksList);
      } catch (error) {
        console.error("Error loading banks:", error);
        toast.error("Failed to load banks. Please try again later.");
      } finally {
        setIsLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  const handleVerify = async () => {
    if (!accountNumber || !selectedBankCode) {
      toast.error("Please enter an account number and select a bank");
      return;
    }

    setIsVerifying(true);
    try {
      console.log(`Verifying account ${accountNumber} with bank code ${selectedBankCode}`);
      const result = await verifyBankAccount(accountNumber, selectedBankCode);
      console.log("Verification result:", result);
      
      if (result.verified && result.accountName) {
        setAccountName(result.accountName);
        setIsVerified(true);
        toast.success("Account verified successfully!");
      } else {
        setIsVerified(false);
        toast.error(result.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      setIsVerified(false);
      toast.error("Failed to verify account. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-md font-medium">Bank Details</h4>
        <p className="text-xs text-muted-foreground">Verification is optional</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full space-y-1.5">
          <Label htmlFor="account-name-manual">Account Name</Label>
          <div className="relative">
            <Input
              id="account-name-manual"
              value={accountName}
              onChange={(e) => {
                setAccountName(e.target.value);
                if (isVerified) setIsVerified(false);
              }}
              placeholder="Enter account holder name"
              className={isVerified ? "border-green-500 pr-10" : ""}
              readOnly={isVerified}
            />
            {isVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          {isVerified && (
            <p className="text-xs text-green-600">Account holder verified</p>
          )}
        </div>

        <div className="w-full space-y-1.5">
          <Label htmlFor="account-number">Account Number</Label>
          <div className="relative">
            <Input 
              id="account-number" 
              placeholder="Enter 10-digit NUBAN number" 
              maxLength={10}
              value={accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                setAccountNumber(value);
                if (isVerified) setIsVerified(false);
              }}
              className={isVerified ? "border-green-500 pr-10" : ""}
              readOnly={isVerified}
            />
            {isVerified && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                <Check className="h-4 w-4" />
              </div>
            )}
          </div>
          {isVerified && (
            <p className="text-xs text-green-600">Account number verified</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BankSelector
          banks={banks}
          bankName={bankName}
          setBankName={setBankName}
          setSelectedBankCode={setSelectedBankCode}
          isVerified={isVerified}
          isLoading={isLoadingBanks}
        />

        <AccountVerifier
          accountNumber={accountNumber}
          selectedBankCode={selectedBankCode}
          setAccountName={setAccountName}
          setIsVerified={setIsVerified}
          isVerified={isVerified}
          disabled={!accountNumber || accountNumber.length !== 10 || !selectedBankCode || isVerifying || isLoadingBanks}
          isVerifying={isVerifying}
        />
      </div>

      {/* Additional bank details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <Label htmlFor="bank-address">Bank Address</Label>
          <Input
            id="bank-address"
            value={bankAddress}
            onChange={(e) => setBankAddress(e.target.value)}
            placeholder="Enter bank address"
          />
        </div>

        <div className="w-full">
          <Label htmlFor="swift-code">SWIFT/BIC Code</Label>
          <Input
            id="swift-code"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            placeholder="Enter SWIFT/BIC code"
          />
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
