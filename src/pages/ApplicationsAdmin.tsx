
import { useState } from "react";
import DashboardContainer from "@/components/dashboard/layout/DashboardContainer";
import { Button } from "@/components/ui/button";
import ApplicationsTable from "@/components/applications/ApplicationsTable";

const ApplicationsAdmin = () => {
  return (
    <DashboardContainer>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Job Applications Administration</h1>
          <Button>Export Data</Button>
        </div>
        
        <ApplicationsTable />
      </div>
    </DashboardContainer>
  );
};

export default ApplicationsAdmin;
