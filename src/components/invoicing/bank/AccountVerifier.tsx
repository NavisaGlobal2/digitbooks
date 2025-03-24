
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { verifyBankAccount } from "@/utils/paystackService";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AccountVerifierProps {
  accountNumber?: string;
  selectedBankCode?: string;
  setAccountName?: (value: string) => void;
  setIsVerified?: (value: boolean) => void;
  isVerified?: boolean;
  disabled?: boolean;
  isVerifying?: boolean;
  onVerify?: () => Promise<void>;
}

const AccountVerifier = ({
  accountNumber,
  selectedBankCode,
  setAccountName,
  setIsVerified,
  isVerified = false,
  disabled = false,
  isVerifying = false,
  onVerify
}: AccountVerifierProps) => {
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const handleVerify = async () => {
    if (onVerify) {
      await onVerify();
      return;
    }

    setIsError(false);
    setVerificationMessage("");

    if (!accountNumber || accountNumber.length !== 10) {
      toast.error("Please enter a valid 10-digit NUBAN account number");
      setIsError(true);
      setVerificationMessage("Please enter a valid 10-digit NUBAN account number");
      return;
    }

    if (!selectedBankCode) {
      toast.error("Please select a bank first");
      setIsError(true);
      setVerificationMessage("Please select a bank first");
      return;
    }

    try {
      const result = await verifyBankAccount(accountNumber, selectedBankCode);
      
      if (result.verified && result.accountName && setAccountName && setIsVerified) {
        setAccountName(result.accountName);
        setIsVerified(true);
        setIsError(false);
        toast.success(result.message || "Account verified successfully");
        setVerificationMessage(`Account verified: ${result.accountName}`);
      } else {
        if (setIsVerified) setIsVerified(false);
        setIsError(true);
        toast.error(result.message || "Verification failed");
        setVerificationMessage(result.message || "Verification failed");
      }
    } catch (error) {
      console.error("Verification error:", error);
      if (setIsVerified) setIsVerified(false);
      setIsError(true);
      toast.error("An error occurred during verification");
      setVerificationMessage("An error occurred during verification");
    }
  };

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleVerify} 
        disabled={isVerifying || disabled}
        className={`w-full ${isVerified ? "bg-green-600 hover:bg-green-700" : "bg-primary"} text-white`}
        variant={isVerified ? "success" : "default"}
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
        <Alert variant={isError ? "destructive" : "default"} className={`py-2 ${isVerified ? 'bg-green-50 border-green-200' : ''}`}>
          <div className="flex items-start">
            {isError ? 
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> : 
              isVerified ? <Check className="h-4 w-4 mr-2 text-green-500" /> : null
            }
            <AlertDescription className="text-sm">
              {verificationMessage}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default AccountVerifier;
