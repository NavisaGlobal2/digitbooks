
import { supabase } from "@/integrations/supabase/client";
import { ParsedTransaction } from "./types";
import { toast } from "sonner";

const EDGE_FUNCTION_TIMEOUT = 60000; // 60 seconds
const EDGE_FUNCTION_NAME = "parse-bank-statement";

export interface ParseResult {
  success: boolean;
  transactions?: ParsedTransaction[];
  error?: string;
  authError?: boolean;
}

export async function parseViaEdgeFunction(
  file: File,
  onSuccessCallback: (transactions: ParsedTransaction[]) => void,
  onErrorCallback: (errorMessage: string) => boolean
): Promise<ParseResult> {
  try {
    // Check authentication
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !sessionData.session) {
      console.error("Authentication error:", sessionError || "No active session");
      return {
        success: false,
        error: "Authentication failed: Please sign in to use this feature",
        authError: true
      };
    }
    
    // Create form data
    const formData = new FormData();
    formData.append("file", file);
    
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), EDGE_FUNCTION_TIMEOUT);
    
    console.log("Invoking edge function with auth token length:", sessionData.session.access_token.length);
    
    // Invoke edge function with proper authentication
    const { data, error } = await supabase.functions.invoke(EDGE_FUNCTION_NAME, {
      body: formData,
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
      }
      // Removed the signal property as it's not supported in FunctionInvokeOptions
    });
    
    clearTimeout(timeoutId);
    
    // Handle errors
    if (error) {
      console.error("Edge function error:", error);
      
      // Check if it's an authentication error
      const isAuthError = 
        error.message?.toLowerCase().includes('auth') || 
        error.message?.toLowerCase().includes('unauthorized') ||
        error.message?.toLowerCase().includes('token');
      
      const errorMessage = isAuthError
        ? "Authentication error: Please sign in again to use this feature"
        : `Server processing error: ${error.message || "Unknown error"}`;
      
      onErrorCallback(errorMessage);
      
      return {
        success: false,
        error: errorMessage,
        authError: isAuthError
      };
    }
    
    // Handle successful response
    if (data && Array.isArray(data.transactions)) {
      // Process the transactions
      const transactions: ParsedTransaction[] = data.transactions.map((tx: any, index: number) => ({
        id: `tx-${index}-${Date.now()}`,
        date: tx.date,
        description: tx.description || tx.narrative || tx.payee || "",
        amount: tx.amount,
        type: tx.type || (tx.amount < 0 ? "debit" : "credit"),
        balance: tx.balance,
        category: null,
        selected: true,
        notes: tx.notes || ""
      }));
      
      onSuccessCallback(transactions);
      
      return {
        success: true,
        transactions
      };
    } else {
      // No transactions or invalid data format
      const errorMessage = "No valid transactions found in the bank statement";
      onErrorCallback(errorMessage);
      
      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error: any) {
    let errorMessage = "Processing error: ";
    
    // Check if it's an abort error (timeout)
    if (error.name === "AbortError") {
      errorMessage = "Processing timed out. Please try again with a smaller file or use client-side processing.";
    } else if (error.message?.includes("Failed to fetch")) {
      errorMessage = "Network error: Connection to server failed. Check your internet connection.";
    } else {
      errorMessage += error.message || "Unknown error occurred";
    }
    
    console.error("Edge function processing error:", error);
    onErrorCallback(errorMessage);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}
