import { useVisaDocs } from "@/contexts/VisaDocsContext";
import { VISA_TYPE_LABELS, SUBMISSION_STATUS_LABELS } from "@/types/visaDocs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ChevronRight, FileText } from "lucide-react";
import { format } from "date-fns";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  ready: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const SubmissionList = () => {
  const { submissions, setActiveSubmission, deleteSubmission } = useVisaDocs();

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">No submissions yet</h3>
        <p className="text-sm text-muted-foreground">
          Create a new visa submission to get started with your document checklist.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map(submission => {
        const requiredDocs = submission.documents.filter(d => d.required);
        const completedDocs = requiredDocs.filter(d => d.status === "uploaded" || d.status === "verified");
        const progress = requiredDocs.length > 0
          ? Math.round((completedDocs.length / requiredDocs.length) * 100)
          : 100;

        return (
          <Card
            key={submission.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setActiveSubmission(submission.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">
                      {VISA_TYPE_LABELS[submission.visaType]} — {submission.country}
                    </h3>
                    <Badge className={statusColors[submission.status] || ""} variant="secondary">
                      {SUBMISSION_STATUS_LABELS[submission.status]}
                    </Badge>
                  </div>
                  {submission.applicantName && (
                    <p className="text-sm text-muted-foreground mb-1">{submission.applicantName}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Created {format(new Date(submission.createdAt), "MMM d, yyyy")}</span>
                    <span>{completedDocs.length}/{requiredDocs.length} required docs ready</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={e => {
                      e.stopPropagation();
                      deleteSubmission(submission.id);
                    }}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SubmissionList;
