import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import {
  VisaSubmission,
  VisaDocument,
  DocumentStatus,
  SubmissionStatus,
  VisaType,
} from "@/types/visaDocs";
import { getTemplate } from "@/components/visa-docs/visaDocumentTemplates";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

interface VisaDocsContextType {
  submissions: VisaSubmission[];
  activeSubmission: VisaSubmission | null;
  createSubmission: (visaType: VisaType, country: string, applicantName?: string) => void;
  setActiveSubmission: (id: string | null) => void;
  updateDocumentStatus: (docId: string, status: DocumentStatus, fileUrl?: string, fileName?: string) => void;
  updateSubmissionStatus: (status: SubmissionStatus) => void;
  updateSubmissionNotes: (notes: string) => void;
  updateDocumentNotes: (docId: string, notes: string) => void;
  deleteSubmission: (id: string) => void;
  getCompletionPercentage: () => number;
  loading: boolean;
}

const VisaDocsContext = createContext<VisaDocsContextType | undefined>(undefined);

export const useVisaDocs = () => {
  const context = useContext(VisaDocsContext);
  if (!context) {
    throw new Error("useVisaDocs must be used within a VisaDocsProvider");
  }
  return context;
};

interface VisaDocsProviderProps {
  children: ReactNode;
}

export const VisaDocsProvider = ({ children }: VisaDocsProviderProps) => {
  const [submissions, setSubmissions] = useState<VisaSubmission[]>([]);
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const activeSubmission = submissions.find(s => s.id === activeSubmissionId) || null;

  const createSubmission = useCallback((visaType: VisaType, country: string, applicantName?: string) => {
    const template = getTemplate(visaType, country);
    if (!template) {
      toast.error("No template found for this visa type and country combination");
      return;
    }

    const now = new Date().toISOString();
    const documents: VisaDocument[] = template.requiredDocuments.map(doc => ({
      ...doc,
      id: uuidv4(),
      status: "not_started" as DocumentStatus,
    }));

    const newSubmission: VisaSubmission = {
      id: uuidv4(),
      visaType,
      country,
      status: "draft",
      documents,
      createdAt: now,
      updatedAt: now,
      applicantName,
    };

    setSubmissions(prev => [newSubmission, ...prev]);
    setActiveSubmissionId(newSubmission.id);
    toast.success("Visa submission created successfully");
  }, []);

  const setActiveSubmission = useCallback((id: string | null) => {
    setActiveSubmissionId(id);
  }, []);

  const updateDocumentStatus = useCallback((docId: string, status: DocumentStatus, fileUrl?: string, fileName?: string) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id !== activeSubmissionId) return submission;
      return {
        ...submission,
        updatedAt: new Date().toISOString(),
        documents: submission.documents.map(doc => {
          if (doc.id !== docId) return doc;
          return {
            ...doc,
            status,
            fileUrl: fileUrl ?? doc.fileUrl,
            fileName: fileName ?? doc.fileName,
            uploadedAt: status === "uploaded" || status === "verified" ? new Date().toISOString() : doc.uploadedAt,
          };
        }),
      };
    }));
  }, [activeSubmissionId]);

  const updateSubmissionStatus = useCallback((status: SubmissionStatus) => {
    if (!activeSubmissionId) return;
    setSubmissions(prev => prev.map(submission => {
      if (submission.id !== activeSubmissionId) return submission;
      return { ...submission, status, updatedAt: new Date().toISOString() };
    }));
    toast.success(`Submission status updated to "${status}"`);
  }, [activeSubmissionId]);

  const updateSubmissionNotes = useCallback((notes: string) => {
    if (!activeSubmissionId) return;
    setSubmissions(prev => prev.map(submission => {
      if (submission.id !== activeSubmissionId) return submission;
      return { ...submission, notes, updatedAt: new Date().toISOString() };
    }));
  }, [activeSubmissionId]);

  const updateDocumentNotes = useCallback((docId: string, notes: string) => {
    setSubmissions(prev => prev.map(submission => {
      if (submission.id !== activeSubmissionId) return submission;
      return {
        ...submission,
        updatedAt: new Date().toISOString(),
        documents: submission.documents.map(doc => {
          if (doc.id !== docId) return doc;
          return { ...doc, notes };
        }),
      };
    }));
  }, [activeSubmissionId]);

  const deleteSubmission = useCallback((id: string) => {
    setSubmissions(prev => prev.filter(s => s.id !== id));
    if (activeSubmissionId === id) {
      setActiveSubmissionId(null);
    }
    toast.success("Submission deleted");
  }, [activeSubmissionId]);

  const getCompletionPercentage = useCallback(() => {
    if (!activeSubmission) return 0;
    const requiredDocs = activeSubmission.documents.filter(d => d.required);
    if (requiredDocs.length === 0) return 100;
    const completedDocs = requiredDocs.filter(d => d.status === "uploaded" || d.status === "verified");
    return Math.round((completedDocs.length / requiredDocs.length) * 100);
  }, [activeSubmission]);

  return (
    <VisaDocsContext.Provider
      value={{
        submissions,
        activeSubmission,
        createSubmission,
        setActiveSubmission,
        updateDocumentStatus,
        updateSubmissionStatus,
        updateSubmissionNotes,
        updateDocumentNotes,
        deleteSubmission,
        getCompletionPercentage,
        loading,
      }}
    >
      {children}
    </VisaDocsContext.Provider>
  );
};
