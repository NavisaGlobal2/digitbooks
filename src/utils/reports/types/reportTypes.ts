
export interface ReportData {
  title: string;
  period: string;
  dateRange?: { startDate: Date; endDate: Date } | null;
  reportData?: any;
}
