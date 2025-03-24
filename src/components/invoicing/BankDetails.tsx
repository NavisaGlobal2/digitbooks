
import BankDetailsForm from "./bank/BankDetailsForm";

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

const BankDetails = ({ 
  accountName, setAccountName,
  accountNumber, setAccountNumber,
  bankName, setBankName,
  bankAddress, setBankAddress,
  swiftCode, setSwiftCode,
  isVerified, setIsVerified
}: BankDetailsProps) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-border">
      <h3 className="text-lg font-medium mb-4">Issuer bank details</h3>
      
      <BankDetailsForm
        accountName={accountName}
        setAccountName={setAccountName}
        accountNumber={accountNumber}
        setAccountNumber={setAccountNumber}
        bankName={bankName}
        setBankName={setBankName}
        bankAddress={bankAddress}
        setBankAddress={setBankAddress}
        swiftCode={swiftCode}
        setSwiftCode={setSwiftCode}
        isVerified={isVerified}
        setIsVerified={setIsVerified}
      />
    </div>
  );
};

export default BankDetails;
