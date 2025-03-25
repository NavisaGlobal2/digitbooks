
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface BusinessType {
  value: string;
  label: string;
}

interface Industry {
  value: string;
  label: string;
}

interface BusinessInfo {
  name: string;
  type: string;
  industry: string;
  size: string;
  country: string;
  state: string;
  city: string;
  address: string;
  phone: string;
  website: string;
}

interface BusinessInfoStepProps {
  businessInfo: BusinessInfo;
  onBusinessInfoChange: (info: BusinessInfo) => void;
  businessTypes: BusinessType[];
  industries: Industry[];
  onNext: () => void;
}

const BusinessInfoStep: React.FC<BusinessInfoStepProps> = ({
  businessInfo,
  onBusinessInfoChange,
  businessTypes,
  industries,
  onNext,
}) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleNext = () => {
    const newErrors: Record<string, boolean> = {};
    let hasErrors = false;

    if (!businessInfo.name) {
      newErrors.name = true;
      hasErrors = true;
    }

    if (!businessInfo.type) {
      newErrors.type = true;
      hasErrors = true;
    }

    if (!businessInfo.industry) {
      newErrors.industry = true;
      hasErrors = true;
    }

    setErrors(newErrors);

    if (hasErrors) {
      toast.error("Please fill in all required fields");
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="business-name" className={errors.name ? "text-destructive" : ""}>
          Business name *
        </Label>
        <Input
          id="business-name"
          value={businessInfo.name}
          onChange={(e) => onBusinessInfoChange({ ...businessInfo, name: e.target.value })}
          placeholder="Enter your business name"
          className={errors.name ? "border-destructive" : ""}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="business-type" className={errors.type ? "text-destructive" : ""}>
          Business type *
        </Label>
        <Select 
          value={businessInfo.type}
          onValueChange={(value) => onBusinessInfoChange({ ...businessInfo, type: value })}
        >
          <SelectTrigger className={errors.type ? "border-destructive" : ""}>
            <SelectValue placeholder="Select business type" />
          </SelectTrigger>
          <SelectContent>
            {businessTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry" className={errors.industry ? "text-destructive" : ""}>
          Industry *
        </Label>
        <Select 
          value={businessInfo.industry}
          onValueChange={(value) => onBusinessInfoChange({ ...businessInfo, industry: value })}
        >
          <SelectTrigger className={errors.industry ? "border-destructive" : ""}>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Business phone</Label>
          <Input
            id="phone"
            type="tel"
            value={businessInfo.phone}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, phone: e.target.value })}
            placeholder="Enter business phone"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Business website</Label>
          <Input
            id="website"
            type="url"
            value={businessInfo.website}
            onChange={(e) => onBusinessInfoChange({ ...businessInfo, website: e.target.value })}
            placeholder="Enter website URL"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Business address</Label>
        <Input
          id="address"
          value={businessInfo.address}
          onChange={(e) => onBusinessInfoChange({ ...businessInfo, address: e.target.value })}
          placeholder="Enter business address"
        />
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

export default BusinessInfoStep;
