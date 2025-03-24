
import { BusinessInfo, LegalInfo, ValidationResult } from "@/types/onboarding";

export const validateBusinessInfo = (businessInfo: BusinessInfo): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!businessInfo.name.trim()) {
    errors.name = "Business name is required";
  }
  
  if (!businessInfo.type) {
    errors.type = "Business type is required";
  }
  
  if (!businessInfo.industry) {
    errors.industry = "Industry is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateLegalInfo = (legalInfo: LegalInfo): ValidationResult => {
  const errors: Record<string, string> = {};
  
  if (!legalInfo.rcNumber.trim()) {
    errors.rcNumber = "RC Number is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
