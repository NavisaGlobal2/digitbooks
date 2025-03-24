
import { useState } from "react";
import { Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusBadge from "./StatusBadge";
import ApplicationDetailView from "./ApplicationDetailView";

interface JobApplication {
  id: string;
  job_title: string;
  job_department: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
  resume_url: string | null;
  experience: string;
  portfolio_link: string | null;
  availability: string;
  cover_letter: string | null;
  status: string;
}

interface ApplicationsTableProps {
  applications: JobApplication[];
  onDownloadResume: (resumeUrl: string | null, applicantName: string) => void;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

const ApplicationsTable = ({ 
  applications, 
  onDownloadResume, 
  onStatusChange 
}: ApplicationsTableProps) => {
  const [selectedApplication, setSelectedApplication] = useState<JobApplication | null>(null);

  return (
    <div className="rounded-md border">
      <Table>
        <TableCaption>List of job applications</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((app) => (
            <TableRow key={app.id}>
              <TableCell className="font-medium">{app.full_name}</TableCell>
              <TableCell>{app.job_title}</TableCell>
              <TableCell>{app.job_department}</TableCell>
              <TableCell>{app.email}</TableCell>
              <TableCell>{new Date(app.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <Select
                  defaultValue={app.status || 'new'}
                  onValueChange={(value) => onStatusChange(app.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue>
                      <StatusBadge status={app.status as any} />
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new" className="flex items-center gap-2">
                      <StatusBadge status="new" />
                    </SelectItem>
                    <SelectItem value="in-review" className="flex items-center gap-2">
                      <StatusBadge status="in-review" />
                    </SelectItem>
                    <SelectItem value="accepted" className="flex items-center gap-2">
                      <StatusBadge status="accepted" />
                    </SelectItem>
                    <SelectItem value="rejected" className="flex items-center gap-2">
                      <StatusBadge status="rejected" />
                    </SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                {app.resume_url ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onDownloadResume(app.resume_url, app.full_name)}
                  >
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                ) : (
                  <span className="text-xs text-muted-foreground">No resume</span>
                )}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setSelectedApplication(app)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View
                    </Button>
                  </DialogTrigger>
                  {selectedApplication && app.id === selectedApplication.id && (
                    <ApplicationDetailView 
                      application={app}
                      onDownloadResume={onDownloadResume}
                      onStatusChange={onStatusChange}
                    />
                  )}
                </Dialog>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ApplicationsTable;
