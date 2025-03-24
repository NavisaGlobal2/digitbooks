
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LegalInfo {
  rcNumber: string;
  taxId: string;
  vatNumber: string;
  registrationDate: string;
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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="rc-number">RC Number *</Label>
        <Input
          id="rc-number"
          value={legalInfo.rcNumber}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, rcNumber: e.target.value })}
          placeholder="Enter RC Number"
          required
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

      <div className="space-y-2">
        <Label htmlFor="registration-date">Business Registration Date</Label>
        <Input
          id="registration-date"
          type="date"
          value={legalInfo.registrationDate}
          onChange={(e) => onLegalInfoChange({ ...legalInfo, registrationDate: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          The date your business was registered with CAC
        </p>
      </div>

      <Button 
        className="w-full bg-green-500 hover:bg-green-600 text-white"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  );
};

export default LegalInfoStep;
