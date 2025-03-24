
import { useState, useEffect } from "react";
import { fetchBanks, verifyBankAccount } from "@/utils/paystackService";
import AccountNumberInput from "./AccountNumberInput";
import AccountNameInput from "./AccountNameInput"; 
import BankSelector from "./BankSelector";
import AccountVerifier from "./AccountVerifier";
import { toast } from "sonner";

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
      const result = await verifyBankAccount(accountNumber, selectedBankCode);
      
      if (result.verified && result.accountName) {
        setAccountName(result.accountName);
        setIsVerified(true);
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <BankSelector
          banks={banks}
          bankName={bankName}
          setBankName={setBankName}
          setSelectedBankCode={setSelectedBankCode}
          isVerified={isVerified}
          isLoading={isLoadingBanks}
        />

        <div className="w-full">
          <AccountNumberInput
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            isVerified={isVerified}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AccountNameInput
          accountName={accountName}
          setAccountName={setAccountName}
          isVerified={isVerified}
          setIsVerified={setIsVerified}
          isVerifying={isVerifying}
        />

        <AccountVerifier
          onVerify={handleVerify}
          isVerified={isVerified}
          disabled={!accountNumber || !selectedBankCode || isVerifying}
          isVerifying={isVerifying}
        />
      </div>

      {/* Additional bank details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="w-full">
          <label htmlFor="bank-address" className="block text-sm font-medium text-gray-700 mb-1">
            Bank Address
          </label>
          <input
            type="text"
            id="bank-address"
            value={bankAddress}
            onChange={(e) => setBankAddress(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter bank address"
          />
        </div>

        <div className="w-full">
          <label htmlFor="swift-code" className="block text-sm font-medium text-gray-700 mb-1">
            SWIFT/BIC Code
          </label>
          <input
            type="text"
            id="swift-code"
            value={swiftCode}
            onChange={(e) => setSwiftCode(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter SWIFT/BIC code"
          />
        </div>
      </div>
    </div>
  );
};

export default BankDetailsForm;
