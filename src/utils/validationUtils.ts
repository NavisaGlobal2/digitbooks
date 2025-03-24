
export const validateBusinessInfo = (businessInfo: {
  name: string;
  type: string;
  industry: string;
}) => {
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

export const validateLegalInfo = (legalInfo: {
  rcNumber: string;
}) => {
  const errors: Record<string, string> = {};
  
  if (!legalInfo.rcNumber.trim()) {
    errors.rcNumber = "RC Number is required";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
