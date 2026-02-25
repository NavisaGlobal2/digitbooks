import { useState } from "react";
import { useVisaDocs } from "@/contexts/VisaDocsContext";
import {
  DocumentCategory,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_STATUS_LABELS,
  VisaDocument,
} from "@/types/visaDocs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  Circle,
  Clock,
  Upload,
  ChevronDown,
  ChevronUp,
  FileCheck,
  StickyNote,
} from "lucide-react";
import DocumentUploadDialog from "./DocumentUploadDialog";

const statusIcons: Record<string, React.ReactNode> = {
  not_started: <Circle className="h-5 w-5 text-gray-400" />,
  in_progress: <Clock className="h-5 w-5 text-yellow-500" />,
  uploaded: <Upload className="h-5 w-5 text-blue-500" />,
  verified: <CheckCircle2 className="h-5 w-5 text-green-500" />,
};

const statusBadgeColors: Record<string, string> = {
  not_started: "bg-gray-100 text-gray-600",
  in_progress: "bg-yellow-100 text-yellow-700",
  uploaded: "bg-blue-100 text-blue-700",
  verified: "bg-green-100 text-green-700",
};

const DocumentChecklist = () => {
  const { activeSubmission, updateDocumentNotes } = useVisaDocs();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(["financial", "identity", "employment", "travel", "supporting"]));
  const [uploadDocId, setUploadDocId] = useState<string | null>(null);
  const [notesDocId, setNotesDocId] = useState<string | null>(null);

  if (!activeSubmission) return null;

  const documentsByCategory = activeSubmission.documents.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = [];
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<DocumentCategory, VisaDocument[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const categoryOrder: DocumentCategory[] = ["identity", "financial", "employment", "travel", "supporting"];

  return (
    <>
      <div className="space-y-4">
        {categoryOrder.map(category => {
          const docs = documentsByCategory[category];
          if (!docs || docs.length === 0) return null;

          const completedCount = docs.filter(d => d.status === "uploaded" || d.status === "verified").length;
          const isExpanded = expandedCategories.has(category);

          return (
            <Card key={category}>
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category)}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-medium">
                          {DOCUMENT_CATEGORY_LABELS[category]}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {completedCount}/{docs.length}
                        </Badge>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {docs.map(doc => (
                        <div key={doc.id} className="flex items-start gap-3 p-3 rounded-lg border bg-white">
                          <div className="mt-0.5">{statusIcons[doc.status]}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-medium text-sm">{doc.name}</span>
                              {doc.required && (
                                <Badge variant="outline" className="text-xs border-red-200 text-red-600">
                                  Required
                                </Badge>
                              )}
                              <Badge className={statusBadgeColors[doc.status]} variant="secondary">
                                {DOCUMENT_STATUS_LABELS[doc.status]}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{doc.description}</p>
                            {doc.fileName && (
                              <p className="text-xs text-blue-600 flex items-center gap-1">
                                <FileCheck className="h-3 w-3" />
                                {doc.fileName}
                              </p>
                            )}
                            {notesDocId === doc.id ? (
                              <div className="mt-2">
                                <Textarea
                                  placeholder="Add notes about this document..."
                                  defaultValue={doc.notes || ""}
                                  onBlur={e => {
                                    updateDocumentNotes(doc.id, e.target.value);
                                    setNotesDocId(null);
                                  }}
                                  className="text-xs min-h-[60px]"
                                  autoFocus
                                />
                              </div>
                            ) : doc.notes ? (
                              <p
                                className="text-xs text-muted-foreground mt-1 cursor-pointer hover:text-foreground"
                                onClick={() => setNotesDocId(doc.id)}
                              >
                                <StickyNote className="h-3 w-3 inline mr-1" />
                                {doc.notes}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setNotesDocId(notesDocId === doc.id ? null : doc.id)}
                              className="text-muted-foreground"
                            >
                              <StickyNote className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setUploadDocId(doc.id)}
                            >
                              <Upload className="h-4 w-4 mr-1" />
                              {doc.status === "not_started" || doc.status === "in_progress" ? "Upload" : "Replace"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <DocumentUploadDialog
        open={!!uploadDocId}
        onOpenChange={open => { if (!open) setUploadDocId(null); }}
        documentId={uploadDocId}
      />
    </>
  );
};

export default DocumentChecklist;
