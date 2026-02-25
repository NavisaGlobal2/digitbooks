export type VisaType =
  | "tourist"
  | "business"
  | "work"
  | "student"
  | "immigrant";

export type DocumentStatus = "not_started" | "in_progress" | "uploaded" | "verified";

export type SubmissionStatus = "draft" | "ready" | "submitted" | "approved" | "rejected";

export interface VisaDocument {
  id: string;
  name: string;
  description: string;
  required: boolean;
  status: DocumentStatus;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
  notes?: string;
  category: DocumentCategory;
}

export type DocumentCategory =
  | "financial"
  | "identity"
  | "employment"
  | "travel"
  | "supporting";

export interface VisaSubmission {
  id: string;
  visaType: VisaType;
  country: string;
  status: SubmissionStatus;
  documents: VisaDocument[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
  applicantName?: string;
}

export interface VisaDocumentTemplate {
  visaType: VisaType;
  country: string;
  requiredDocuments: Omit<VisaDocument, "id" | "status" | "fileUrl" | "fileName" | "uploadedAt">[];
}

export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  tourist: "Tourist Visa",
  business: "Business Visa",
  work: "Work Visa",
  student: "Student Visa",
  immigrant: "Immigration Visa",
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  financial: "Financial Documents",
  identity: "Identity & Personal",
  employment: "Employment & Business",
  travel: "Travel Documents",
  supporting: "Supporting Documents",
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  uploaded: "Uploaded",
  verified: "Verified",
};

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  draft: "Draft",
  ready: "Ready to Submit",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};
