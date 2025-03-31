
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";

export interface InvoiceHistoryItem {
  type: "invoice" | "receipt";
  clientName: string;
  date: Date;
  fileName: string;
  amount: number;
  invoiceNumber: string;
  pdfBlob?: Blob;
}

/**
 * Save invoice to history in localStorage or database
 */
export const saveInvoiceToHistory = async (invoice: InvoiceHistoryItem) => {
  try {
    // First try to save to localStorage
    const historyKey = "invoice_history";
    let history: Partial<InvoiceHistoryItem>[] = [];
    
    try {
      const savedHistory = localStorage.getItem(historyKey);
      if (savedHistory) {
        history = JSON.parse(savedHistory);
      }
    } catch (error) {
      console.error("Error parsing invoice history:", error);
    }
    
    // Create a new item without the blob to save to localStorage
    const itemToSave = {
      ...invoice,
      date: invoice.date.toISOString(),
      pdfBlob: undefined // Don't store blob in localStorage
    };
    
    // Add to history, keeping most recent 50 items
    history = [itemToSave, ...history].slice(0, 50);
    
    // Save updated history
    try {
      localStorage.setItem(historyKey, JSON.stringify(history));
    } catch (storageError) {
      console.warn("Could not save to localStorage:", storageError);
    }
    
    // If we have Supabase, also save there for persistence
    try {
      const user = useAuth().user;
      if (user?.id && supabase) {
        // Save to the new invoice_history table
        await supabase.from("invoice_history").insert({
          user_id: user.id,
          client_name: invoice.clientName,
          invoice_date: invoice.date.toISOString(),
          file_name: invoice.fileName,
          amount: invoice.amount,
          invoice_number: invoice.invoiceNumber,
          type: invoice.type
        });
      }
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
    }
    
    return true;
  } catch (error) {
    console.error("Error saving invoice history:", error);
    return false;
  }
};

/**
 * Get invoice history
 */
export const getInvoiceHistory = (): InvoiceHistoryItem[] => {
  try {
    const historyKey = "invoice_history";
    const savedHistory = localStorage.getItem(historyKey);
    
    if (!savedHistory) {
      return [];
    }
    
    const parsedHistory = JSON.parse(savedHistory);
    
    // Convert ISO date strings back to Date objects
    return parsedHistory.map((item: any) => ({
      ...item,
      date: new Date(item.date)
    }));
  } catch (error) {
    console.error("Error retrieving invoice history:", error);
    return [];
  }
};

/**
 * Delete invoice from history
 */
export const deleteInvoiceFromHistory = (fileName: string): boolean => {
  try {
    const historyKey = "invoice_history";
    const savedHistory = localStorage.getItem(historyKey);
    
    if (!savedHistory) {
      return false;
    }
    
    let history = JSON.parse(savedHistory);
    
    // Filter out the item to delete
    history = history.filter((item: any) => item.fileName !== fileName);
    
    // Save updated history
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    // Also attempt to delete from database if available
    try {
      const user = useAuth().user;
      if (user?.id && supabase) {
        supabase.from("invoice_history")
          .delete()
          .match({ user_id: user.id, file_name: fileName });
      }
    } catch (dbError) {
      console.error("Error deleting from database:", dbError);
    }
    
    return true;
  } catch (error) {
    console.error("Error deleting invoice history:", error);
    return false;
  }
};

/**
 * Get invoice history from database
 */
export const getInvoiceHistoryFromDB = async (): Promise<InvoiceHistoryItem[]> => {
  try {
    const user = useAuth().user;
    if (!user?.id || !supabase) {
      return [];
    }
    
    const { data, error } = await supabase
      .from("invoice_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
      
    if (error) {
      console.error("Error fetching invoice history from database:", error);
      return [];
    }
    
    // Convert database records to InvoiceHistoryItem format
    return data.map(item => ({
      type: item.type as "invoice" | "receipt",
      clientName: item.client_name,
      date: new Date(item.invoice_date),
      fileName: item.file_name,
      amount: item.amount,
      invoiceNumber: item.invoice_number
    }));
  } catch (error) {
    console.error("Error fetching invoice history from database:", error);
    return [];
  }
};
