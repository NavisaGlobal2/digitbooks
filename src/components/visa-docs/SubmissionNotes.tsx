import { useVisaDocs } from "@/contexts/VisaDocsContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote } from "lucide-react";

const SubmissionNotes = () => {
  const { activeSubmission, updateSubmissionNotes } = useVisaDocs();

  if (!activeSubmission) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <StickyNote className="h-4 w-4" />
          Submission Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Add general notes about this visa submission..."
          value={activeSubmission.notes || ""}
          onChange={e => updateSubmissionNotes(e.target.value)}
          className="min-h-[100px] text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default SubmissionNotes;
