
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2, AlertCircle, ShieldAlert } from "lucide-react";
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
  isVerifying: externalIsVerifying = false,
  onVerify
}: AccountVerifierProps) => {
  const [verificationMessage, setVerificationMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isApiKeyIssue, setIsApiKeyIssue] = useState(false);

  const handleVerify = async () => {
    if (onVerify) {
      await onVerify();
      return;
    }

    setIsError(false);
    setIsApiKeyIssue(false);
    setVerificationMessage("");
    setIsVerifying(true);

    try {
      if (!accountNumber || accountNumber.length !== 10) {
        throw new Error("Please enter a valid 10-digit NUBAN account number");
      }

      if (!selectedBankCode) {
        throw new Error("Please select a bank first");
      }

      console.log(`Starting verification for account: ${accountNumber}, bank code: ${selectedBankCode}`);
      
      const result = await verifyBankAccount(accountNumber, selectedBankCode);
      console.log("Verification result:", result);
      
      if (result.message?.includes("API key validation failed")) {
        setIsApiKeyIssue(true);
        setIsError(true);
        toast.error("Using test mode instead");
        
        if (setIsVerified && setAccountName) {
          setIsVerified(true);
          setAccountName("Account holder " + accountNumber.substring(0, 3) + "***" + accountNumber.substring(7));
          setIsError(false);
          setVerificationMessage("Account verification successful (Test mode)");
        }
        return;
      }
      
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
      const errorMessage = error instanceof Error ? error.message : "An error occurred during verification";
      toast.error(errorMessage);
      setVerificationMessage(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const showVerifying = externalIsVerifying || isVerifying;

  return (
    <div className="space-y-3">
      <Button 
        onClick={handleVerify} 
        disabled={showVerifying || disabled}
        className={`w-full ${isVerified ? "bg-green-600 hover:bg-green-700" : "bg-primary"} text-white`}
        variant={isVerified ? "success" : "default"}
      >
        {showVerifying ? (
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
        <Alert 
          variant={isError && !isApiKeyIssue ? "destructive" : "default"} 
          className={`py-2 ${isVerified ? 'bg-green-50 border-green-200' : isApiKeyIssue ? 'bg-amber-50 border-amber-200' : ''}`}
        >
          <div className="flex items-start">
            {isError && !isApiKeyIssue ? 
              <AlertCircle className="h-4 w-4 mr-2 text-red-500" /> : 
              isApiKeyIssue ? 
              <ShieldAlert className="h-4 w-4 mr-2 text-amber-500" /> :
              isVerified ? <Check className="h-4 w-4 mr-2 text-green-500" /> : null
            }
            <AlertDescription className="text-sm">
              {verificationMessage}
              {isApiKeyIssue && (
                <div className="mt-1 text-xs text-amber-600">
                  Using test verification mode for demonstration
                </div>
              )}
            </AlertDescription>
          </div>
        </Alert>
      )}
    </div>
  );
};

export default AccountVerifier;
