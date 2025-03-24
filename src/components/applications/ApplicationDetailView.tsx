
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import StatusBadge from "./StatusBadge";

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

interface ApplicationDetailViewProps {
  application: JobApplication;
  onDownloadResume: (resumeUrl: string | null, applicantName: string) => void;
  onStatusChange: (applicationId: string, newStatus: string) => void;
}

const ApplicationDetailView = ({ 
  application, 
  onDownloadResume, 
  onStatusChange 
}: ApplicationDetailViewProps) => {
  
  const formatAvailability = (availability: string) => {
    switch(availability) {
      case 'immediately': return 'Immediately';
      case '2weeks': return 'In 2 weeks';
      case '1month': return 'In 1 month';
      case 'other': return 'Other (see cover letter)';
      default: return availability;
    }
  };

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Application Details</DialogTitle>
        <DialogDescription>
          Submitted on {new Date(application.created_at).toLocaleString()}
        </DialogDescription>
      </DialogHeader>
      
      <div className="space-y-4 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium">Full Name</h3>
            <p>{application.full_name}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Position</h3>
            <p>{application.job_title} ({application.job_department})</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Email</h3>
            <p>{application.email}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Phone</h3>
            <p>{application.phone}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Availability</h3>
            <p>{formatAvailability(application.availability)}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium">Status</h3>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={application.status as any} />
              <Select
                defaultValue={application.status || 'new'}
                onValueChange={(value) => onStatusChange(application.id, value)}
              >
                <SelectTrigger className="w-32 h-8">
                  <SelectValue>Change Status</SelectValue>
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
            </div>
          </div>
          {application.portfolio_link && (
            <div>
              <h3 className="text-sm font-medium">Portfolio Link</h3>
              <a 
                href={application.portfolio_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {application.portfolio_link}
              </a>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-sm font-medium">Experience</h3>
          <p className="whitespace-pre-wrap">{application.experience}</p>
        </div>
        
        {application.cover_letter && (
          <div>
            <h3 className="text-sm font-medium">Cover Letter</h3>
            <p className="whitespace-pre-wrap">{application.cover_letter}</p>
          </div>
        )}
        
        <div className="flex justify-end">
          {application.resume_url && (
            <Button 
              onClick={() => onDownloadResume(application.resume_url, application.full_name)}
              variant="accent"
              className="ml-2"
            >
              <Download className="h-4 w-4 mr-2" /> Download Resume
            </Button>
          )}
        </div>
      </div>
    </DialogContent>
  );
};

export default ApplicationDetailView;
