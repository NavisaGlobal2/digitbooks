
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { validateLegalInfo } from "@/utils/validationUtils";
import { toast } from "sonner";
import { LegalInfo } from "@/types/onboarding";

interface LegalInfoStepProps {
  legalInfo: LegalInfo;
  onLegalInfoChange: (info: LegalInfo) => void;
  onNext: () => void;
  onBack?: () => void;
}

const LegalInfoStep: React.FC<LegalInfoStepProps> = ({
  legalInfo,
  onLegalInfoChange,
  onNext,
  onBack,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleNext = () => {
    const validation = validateLegalInfo(legalInfo);
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error("Please provide your RC Number");
      return;
    }
    
    setErrors({});
    onNext();
  };

  return (
    <div className="space-y-4 w-full">
      <div className="space-y-2">
        <Label htmlFor="rc-number" className={errors.rcNumber ? "text-red-500" : "text-gray-700"}>
          RC Number *
        </Label>
        <Input
          id="rc-number"
          value={legalInfo.rcNumber}
          onChange={(e) => {
            onLegalInfoChange({ ...legalInfo, rcNumber: e.target.value });
            if (errors.rcNumber) setErrors({ ...errors, rcNumber: "" });
          }}
          placeholder="Enter RC Number"
          className={`${errors.rcNumber ? "border-red-500" : "border-gray-200"} h-9`}
          required
        />
        {errors.rcNumber && (
          <p className="text-xs text-red-500">{errors.rcNumber}</p>
        )}
        <p className="text-xs text-gray-500">
          Your Corporate Affairs Commission (CAC) registration number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-id" className="text-gray-700">Tax Identification Number (TIN)</Label>
        <Input
          id="tax-id"
          value={legalInfo.taxId}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, taxId: e.target.value })}
          placeholder="Enter TIN (Optional)"
          className="border-gray-200 h-9"
        />
        <p className="text-xs text-gray-500">
          Your Federal Inland Revenue Service (FIRS) tax identification number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vat-number" className="text-gray-700">VAT Registration Number</Label>
        <Input
          id="vat-number"
          value={legalInfo.vatNumber}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, vatNumber: e.target.value })}
          placeholder="Enter VAT number (Optional)"
          className="border-gray-200 h-9"
        />
        <p className="text-xs text-gray-500">
          Your Value Added Tax registration number if applicable
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="registration-date" className="text-gray-700">Business Registration Date</Label>
        <Input
          id="registration-date"
          type="date"
          value={legalInfo.registrationDate}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, registrationDate: e.target.value })}
          className="border-gray-200 h-9"
        />
        <p className="text-xs text-gray-500">
          The date your business was registered with CAC
        </p>
      </div>

      <Button 
        className="w-full bg-[#05D166] hover:bg-[#05D166]/90 text-white h-9 mt-4"
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default LegalInfoStep;
