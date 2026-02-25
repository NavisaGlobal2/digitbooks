import { useVisaDocs } from "@/contexts/VisaDocsContext";
import {
  VISA_TYPE_LABELS,
  SUBMISSION_STATUS_LABELS,
  SubmissionStatus,
} from "@/types/visaDocs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  ready: "bg-blue-100 text-blue-700",
  submitted: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

const SubmissionStatusBar = () => {
  const {
    activeSubmission,
    setActiveSubmission,
    updateSubmissionStatus,
    getCompletionPercentage,
  } = useVisaDocs();

  if (!activeSubmission) return null;

  const completion = getCompletionPercentage();
  const allRequiredUploaded = completion === 100;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveSubmission(null)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold">
                  {VISA_TYPE_LABELS[activeSubmission.visaType]} — {activeSubmission.country}
                </h2>
                <Badge className={statusColors[activeSubmission.status]} variant="secondary">
                  {SUBMISSION_STATUS_LABELS[activeSubmission.status]}
                </Badge>
              </div>
              {activeSubmission.applicantName && (
                <p className="text-sm text-muted-foreground">{activeSubmission.applicantName}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              {allRequiredUploaded ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
              <span className="font-medium">{completion}%</span>
              <span className="text-muted-foreground">complete</span>
            </div>

            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  allRequiredUploaded ? "bg-green-500" : "bg-primary"
                }`}
                style={{ width: `${completion}%` }}
              />
            </div>

            <Select
              value={activeSubmission.status}
              onValueChange={(value) => updateSubmissionStatus(value as SubmissionStatus)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ready" disabled={!allRequiredUploaded}>
                  Ready to Submit
                </SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubmissionStatusBar;
