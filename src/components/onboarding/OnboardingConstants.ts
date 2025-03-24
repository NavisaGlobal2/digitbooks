
import { BusinessType, Industry, OnboardingStep } from "@/types/onboarding";

export const BUSINESS_TYPES: BusinessType[] = [
  { value: "sole_proprietorship", label: "Sole Proprietorship" },
  { value: "partnership", label: "Partnership" },
  { value: "limited_liability", label: "Limited Liability Company" },
  { value: "corporation", label: "Corporation" }
];

export const INDUSTRIES: Industry[] = [
  { value: "technology", label: "Technology" },
  { value: "retail", label: "Retail & Commerce" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "services", label: "Professional Services" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "finance", label: "Finance & Banking" },
  { value: "other", label: "Other" }
];

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "Welcome to DigiBooks",
    description: "Let's get your business set up in just a few steps"
  },
  {
    title: "Business Information",
    description: "Tell us about your business"
  },
  {
    title: "Legal Information",
    description: "Add your business registration details"
  },
  {
    title: "Choose Features",
    description: "Select the features you need"
  },
  {
    title: "Connect Bank Account",
    description: "Link your business bank account"
  }
];
