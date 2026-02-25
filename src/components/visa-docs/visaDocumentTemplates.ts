import { VisaDocumentTemplate } from "@/types/visaDocs";

export const visaDocumentTemplates: VisaDocumentTemplate[] = [
  {
    visaType: "business",
    country: "United States",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months beyond intended stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent 2x2 inch photos with white background", required: true, category: "identity" },
      { name: "Bank Statements (6 months)", description: "Last 6 months of personal/business bank statements", required: true, category: "financial" },
      { name: "Income Tax Returns", description: "Tax returns for the last 2-3 years", required: true, category: "financial" },
      { name: "Business Registration Certificate", description: "Certificate of incorporation or business registration", required: true, category: "employment" },
      { name: "Invitation Letter", description: "Letter from the US company or business partner", required: true, category: "supporting" },
      { name: "Travel Itinerary", description: "Flight reservations and accommodation details", required: true, category: "travel" },
      { name: "Proof of Business Ties", description: "Documents showing business ties to home country", required: false, category: "employment" },
      { name: "Financial Statements (Audited)", description: "Audited financial statements for the business", required: false, category: "financial" },
      { name: "Cover Letter", description: "Letter explaining the purpose and duration of visit", required: false, category: "supporting" },
    ],
  },
  {
    visaType: "tourist",
    country: "United States",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months beyond intended stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent 2x2 inch photos with white background", required: true, category: "identity" },
      { name: "Bank Statements (3 months)", description: "Last 3 months of bank statements", required: true, category: "financial" },
      { name: "Employment Letter", description: "Letter from employer confirming position and leave approval", required: true, category: "employment" },
      { name: "Travel Itinerary", description: "Flight reservations and hotel bookings", required: true, category: "travel" },
      { name: "Travel Insurance", description: "Valid travel insurance coverage", required: false, category: "travel" },
      { name: "Proof of Financial Stability", description: "Investment statements, property documents, etc.", required: false, category: "financial" },
    ],
  },
  {
    visaType: "work",
    country: "United States",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months beyond intended stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent 2x2 inch photos with white background", required: true, category: "identity" },
      { name: "Job Offer Letter", description: "Official job offer from US employer", required: true, category: "employment" },
      { name: "Labor Condition Application", description: "Approved LCA from US Department of Labor", required: true, category: "employment" },
      { name: "Educational Credentials", description: "Degree certificates and transcripts", required: true, category: "identity" },
      { name: "Resume / CV", description: "Updated resume or curriculum vitae", required: true, category: "employment" },
      { name: "Bank Statements (6 months)", description: "Last 6 months of bank statements", required: true, category: "financial" },
      { name: "Income Tax Returns", description: "Tax returns for the last 2-3 years", required: true, category: "financial" },
      { name: "Professional Certifications", description: "Relevant professional licenses or certifications", required: false, category: "employment" },
      { name: "Reference Letters", description: "Professional reference letters from previous employers", required: false, category: "supporting" },
    ],
  },
  {
    visaType: "student",
    country: "United States",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months beyond intended stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent 2x2 inch photos with white background", required: true, category: "identity" },
      { name: "I-20 Form", description: "Certificate of Eligibility from the institution", required: true, category: "travel" },
      { name: "Admission Letter", description: "Official admission letter from the institution", required: true, category: "supporting" },
      { name: "Financial Proof", description: "Proof of funds to cover tuition and living expenses", required: true, category: "financial" },
      { name: "Sponsor Documents", description: "Sponsor's bank statements and affidavit of support (if applicable)", required: false, category: "financial" },
      { name: "Academic Transcripts", description: "Previous academic transcripts and certificates", required: true, category: "identity" },
      { name: "Standardized Test Scores", description: "TOEFL, GRE, GMAT scores as applicable", required: false, category: "supporting" },
    ],
  },
  {
    visaType: "business",
    country: "United Kingdom",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for the duration of your stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent passport-size photos", required: true, category: "identity" },
      { name: "Bank Statements (6 months)", description: "Last 6 months of bank statements showing sufficient funds", required: true, category: "financial" },
      { name: "Business Invitation Letter", description: "Invitation from UK-based business partner or company", required: true, category: "supporting" },
      { name: "Company Letter", description: "Letter from your employer confirming business purpose", required: true, category: "employment" },
      { name: "Travel Itinerary", description: "Details of your planned meetings and accommodation", required: true, category: "travel" },
      { name: "Proof of Accommodation", description: "Hotel bookings or host arrangement details", required: true, category: "travel" },
      { name: "Income Tax Returns", description: "Tax returns for the last 2 years", required: false, category: "financial" },
    ],
  },
  {
    visaType: "tourist",
    country: "United Kingdom",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for the duration of your stay", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent passport-size photos", required: true, category: "identity" },
      { name: "Bank Statements (3 months)", description: "Last 3 months of bank statements", required: true, category: "financial" },
      { name: "Employment Letter", description: "Letter confirming employment and approved leave", required: true, category: "employment" },
      { name: "Travel Itinerary", description: "Flight and hotel booking confirmations", required: true, category: "travel" },
      { name: "Travel Insurance", description: "Comprehensive travel insurance", required: false, category: "travel" },
    ],
  },
  {
    visaType: "business",
    country: "Canada",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Two recent photos meeting Canadian specs", required: true, category: "identity" },
      { name: "Bank Statements (6 months)", description: "Last 6 months of bank statements", required: true, category: "financial" },
      { name: "Business Invitation Letter", description: "Letter from Canadian business contact", required: true, category: "supporting" },
      { name: "Proof of Business Activity", description: "Business registration and activity proof", required: true, category: "employment" },
      { name: "Travel Itinerary", description: "Planned travel and accommodation details", required: true, category: "travel" },
      { name: "Income Tax Returns", description: "Tax returns for the last 2 years", required: false, category: "financial" },
      { name: "Financial Statements", description: "Audited business financial statements", required: false, category: "financial" },
    ],
  },
  {
    visaType: "immigrant",
    country: "United States",
    requiredDocuments: [
      { name: "Valid Passport", description: "Passport valid for at least 6 months", required: true, category: "identity" },
      { name: "Passport Photographs", description: "Multiple recent passport photos", required: true, category: "identity" },
      { name: "Birth Certificate", description: "Original or certified copy of birth certificate", required: true, category: "identity" },
      { name: "Police Clearance Certificate", description: "Criminal record check from all countries lived in", required: true, category: "identity" },
      { name: "Medical Examination Report", description: "Results from approved panel physician", required: true, category: "supporting" },
      { name: "Bank Statements (12 months)", description: "Last 12 months of bank statements", required: true, category: "financial" },
      { name: "Income Tax Returns (3 years)", description: "Tax returns for the last 3 years", required: true, category: "financial" },
      { name: "Employment Records", description: "Complete employment history and verification", required: true, category: "employment" },
      { name: "Affidavit of Support", description: "Financial sponsor's I-864 form and supporting documents", required: true, category: "financial" },
      { name: "Educational Credentials", description: "All degree certificates and transcripts", required: true, category: "identity" },
      { name: "Marriage Certificate", description: "If applicable, certified marriage certificate", required: false, category: "identity" },
      { name: "Property Documents", description: "Evidence of property ownership or assets", required: false, category: "financial" },
    ],
  },
];

export const getAvailableCountries = (): string[] => {
  const countries = new Set(visaDocumentTemplates.map(t => t.country));
  return Array.from(countries).sort();
};

export const getAvailableVisaTypes = (country: string): VisaDocumentTemplate["visaType"][] => {
  return visaDocumentTemplates
    .filter(t => t.country === country)
    .map(t => t.visaType);
};

export const getTemplate = (visaType: string, country: string): VisaDocumentTemplate | undefined => {
  return visaDocumentTemplates.find(t => t.visaType === visaType && t.country === country);
};
