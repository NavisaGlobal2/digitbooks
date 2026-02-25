import { useState } from "react";
import { useVisaDocs } from "@/contexts/VisaDocsContext";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import { Button } from "@/components/ui/button";
import { Plus, FileText } from "lucide-react";
import NewSubmissionDialog from "./NewSubmissionDialog";
import SubmissionList from "./SubmissionList";
import SubmissionStatusBar from "./SubmissionStatusBar";
import DocumentChecklist from "./DocumentChecklist";
import SubmissionNotes from "./SubmissionNotes";
import FinancialSummaryCard from "./FinancialSummaryCard";

const VisaDocs = () => {
  const { activeSubmission } = useVisaDocs();
  const [showNewDialog, setShowNewDialog] = useState(false);

  return (
    <DashboardContainer>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Visa Documents</h1>
          </div>
          {!activeSubmission && (
            <Button onClick={() => setShowNewDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Submission
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground ml-9">
          Prepare and track documents for your visa applications
        </p>
      </div>

      {activeSubmission ? (
        <div className="space-y-4">
          <SubmissionStatusBar />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DocumentChecklist />
            </div>
            <div className="space-y-4">
              <FinancialSummaryCard />
              <SubmissionNotes />
            </div>
          </div>
        </div>
      ) : (
        <SubmissionList />
      )}

      <NewSubmissionDialog open={showNewDialog} onOpenChange={setShowNewDialog} />
    </DashboardContainer>
  );
};

export default VisaDocs;
