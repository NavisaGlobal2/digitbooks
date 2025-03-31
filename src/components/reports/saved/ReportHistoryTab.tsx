
import React from "react";
import SavedReportsSection from "./SavedReportsSection";

const ReportHistoryTab = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Report History</h2>
      <p className="text-muted-foreground">
        View and manage all your previously generated reports
      </p>
      
      <SavedReportsSection />
    </div>
  );
};

export default ReportHistoryTab;
