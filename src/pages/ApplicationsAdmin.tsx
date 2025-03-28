
import { useState } from "react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import { Button } from "@/components/ui/button";
import ApplicationsTable from "@/components/applications/ApplicationsTable";

const ApplicationsAdmin = () => {
  // Mock data for applications
  const [applications, setApplications] = useState([]);

  // Handle downloading resume
  const handleDownloadResume = (resumeUrl: string | null, applicantName: string) => {
    console.log("Downloading resume:", resumeUrl, "for", applicantName);
    // Implementation would go here
  };

  // Handle status change
  const handleStatusChange = (applicationId: string, newStatus: string) => {
    console.log("Changing status for application", applicationId, "to", newStatus);
    // Implementation would go here
  };

  return (
    <DashboardContainer>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Job Applications Administration</h1>
          <Button>Export Data</Button>
        </div>
        
        <ApplicationsTable 
          applications={applications}
          onDownloadResume={handleDownloadResume}
          onStatusChange={handleStatusChange}
        />
      </div>
    </DashboardContainer>
  );
};

export default ApplicationsAdmin;
