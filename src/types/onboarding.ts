
/**
 * Types for the Onboarding flow
 */

export interface BusinessInfo {
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

export interface LegalInfo {
  rcNumber: string;
  taxId: string;
  vatNumber: string;
}

export interface FeatureState {
  invoicing: boolean;
  expenses: boolean;
  banking: boolean;
  reports: boolean;
  budgeting: boolean;
  inventory: boolean;
}

export interface OnboardingStep {
  title: string;
  description: string;
}

export interface BusinessType {
  value: string;
  label: string;
}

export interface Industry {
  value: string;
  label: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}
