
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";

interface AccountNumberInputProps {
  accountNumber: string;
  setAccountNumber: (value: string) => void;
  isVerified: boolean;
}

const AccountNumberInput = ({ 
  accountNumber, 
  setAccountNumber, 
  isVerified 
}: AccountNumberInputProps) => {
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Validate account number format
  useEffect(() => {
    if (accountNumber && accountNumber.length > 0) {
      // Validate if it's a number
      if (!/^\d+$/.test(accountNumber)) {
        setIsValid(false);
        setErrorMessage("Account number must contain only digits");
      } 
      // Validate length (NUBAN is 10 digits)
      else if (accountNumber.length === 10) {
        setIsValid(true);
        setErrorMessage("");
      } 
      else if (accountNumber.length > 0) {
        setIsValid(false);
        setErrorMessage(`Account number must be 10 digits (${accountNumber.length}/10)`);
      }
    } else {
      setIsValid(true);
      setErrorMessage("");
    }
  }, [accountNumber]);

  return (
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
        className={`${isVerified ? "border-green-500" : ""} ${!isValid && !isVerified ? "border-red-500" : ""}`}
      />
      {!isValid && !isVerified && (
        <p className="text-red-500 text-sm mt-1">{errorMessage}</p>
      )}
      {isVerified && (
        <p className="text-green-500 text-sm mt-1">Account verified</p>
      )}
    </div>
  );
};

export default AccountNumberInput;
