
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { verifyBankAccount } from "@/utils/paystackService";
import { toast } from "sonner";

interface AccountVerifierProps {
  accountNumber: string;
  selectedBankCode: string;
  setAccountName: (value: string) => void;
  setIsVerified: (value: boolean) => void;
  isVerified: boolean;
}

const AccountVerifier = ({
  accountNumber,
  selectedBankCode,
  setAccountName,
  setIsVerified,
  isVerified
}: AccountVerifierProps) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");

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
  );
};

export default AccountVerifier;
