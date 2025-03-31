
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedReport {
  id: string;
  report_type: string;
  report_title: string;
  report_period: string;
  start_date?: Date;
  end_date?: Date;
  report_data: any;
  file_format: string;
  created_at: Date;
}

export const saveReportToDatabase = async (
  reportType: string,
  reportTitle: string,
  reportPeriod: string,
  dateRange: { startDate: Date; endDate: Date } | null,
  reportData: any,
  fileFormat: string
): Promise<string | null> => {
  try {
    // Get the user session
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    
    if (!userId) {
      toast.error("Authentication required to save reports");
      return null;
    }

    const reportRecord = {
      user_id: userId,
      report_type: reportType,
      report_title: reportTitle,
      report_period: reportPeriod,
      start_date: dateRange?.startDate || null,
      end_date: dateRange?.endDate || null,
      report_data: reportData,
      file_format: fileFormat
    };

    // Use raw SQL insert for adding to financial_reports table
    const { data, error } = await supabase
      .from('financial_reports')
      .insert(reportRecord as any)
      .select('id')
      .single();

    if (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
      return null;
    }

    toast.success("Report saved successfully");
    return data.id;
  } catch (error) {
    console.error("Error in saveReportToDatabase:", error);
    toast.error("Failed to save report");
    return null;
  }
};

export const fetchUserReports = async (): Promise<SavedReport[]> => {
  try {
    // Use raw SQL query to fetch from financial_reports table
    const { data, error } = await supabase
      .from('financial_reports' as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reports:", error);
      toast.error("Failed to load reports");
      return [];
    }

    return (data as any[]).map((item) => ({
      id: item.id,
      report_type: item.report_type,
      report_title: item.report_title,
      report_period: item.report_period,
      start_date: item.start_date ? new Date(item.start_date) : undefined,
      end_date: item.end_date ? new Date(item.end_date) : undefined,
      report_data: item.report_data,
      file_format: item.file_format,
      created_at: new Date(item.created_at)
    }));
  } catch (error) {
    console.error("Error in fetchUserReports:", error);
    toast.error("Failed to load reports");
    return [];
  }
};

export const deleteReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('financial_reports' as any)
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
      return false;
    }

    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteReport:", error);
    toast.error("Failed to delete report");
    return false;
  }
};
