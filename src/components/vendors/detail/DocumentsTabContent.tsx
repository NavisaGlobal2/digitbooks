
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DocumentsTabContent = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-500">No documents available for this vendor.</p>
      </CardContent>
    </Card>
  );
};

export default DocumentsTabContent;
