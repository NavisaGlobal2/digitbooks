
export interface ReportData {
  title: string;
  period: string;
  data?: any;
  dateRange?: { 
    startDate: Date; 
    endDate: Date 
  } | null;
}

// Add types for jsPDF-autotable to jsPDF
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}
