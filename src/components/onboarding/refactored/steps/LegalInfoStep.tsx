
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LegalInfo {
  rcNumber: string;
  taxId: string;
  vatNumber: string;
}

interface LegalInfoStepProps {
  legalInfo: LegalInfo;
  onLegalInfoChange: (info: LegalInfo) => void;
  onNext: () => void;
}

const LegalInfoStep: React.FC<LegalInfoStepProps> = ({
  legalInfo,
  onLegalInfoChange,
  onNext,
}) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    // RC Number is now optional, so we don't need to validate it
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rc-number" className={errors.rcNumber ? "text-destructive" : ""}>
          RC Number (Optional)
        </Label>
        <Input
          id="rc-number"
          value={legalInfo.rcNumber}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, rcNumber: e.target.value })}
          placeholder="Enter RC Number (Optional)"
          className={errors.rcNumber ? "border-destructive" : ""}
        />
        <p className="text-sm text-muted-foreground">
          Your Corporate Affairs Commission (CAC) registration number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax-id">Tax Identification Number (TIN)</Label>
        <Input
          id="tax-id"
          value={legalInfo.taxId}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, taxId: e.target.value })}
          placeholder="Enter TIN (Optional)"
        />
        <p className="text-sm text-muted-foreground">
          Your Federal Inland Revenue Service (FIRS) tax identification number
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="vat-number">VAT Registration Number</Label>
        <Input
          id="vat-number"
          value={legalInfo.vatNumber}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, vatNumber: e.target.value })}
          placeholder="Enter VAT number (Optional)"
        />
        <p className="text-sm text-muted-foreground">
          Your Value Added Tax registration number if applicable
        </p>
      </div>

      <Button 
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        onClick={handleNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default LegalInfoStep;
