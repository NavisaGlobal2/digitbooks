
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Interface for the bank list response
interface BankListResponse {
  status: boolean;
  message: string;
  data: Array<{
    id: number;
    name: string;
    slug: string;
    code: string;
    longcode: string;
    gateway: string;
    active: boolean;
    country: string;
  }>;
}

// Function to fetch banks from Paystack API via Supabase Edge Function
export const fetchBanks = async (): Promise<Array<{ name: string; code: string }>> => {
  try {
    console.log("Fetching banks from edge function...");
    const { data, error } = await supabase.functions.invoke("list-banks");
    
    if (error) {
      console.error("Error from supabase function:", error);
      toast.error("Could not load banks list. Please try again later.");
      throw new Error(error.message);
    }
    
    if (!data || !data.status) {
      console.error("Error response from Paystack:", data);
      toast.error(data?.message || "Failed to fetch banks list");
      return [];
    }
    
    if (!Array.isArray(data.data)) {
      console.error("Unexpected data format:", data);
      toast.error("Received invalid data format from server");
      return [];
    }
    
    console.log(`Successfully fetched ${data.data.length} banks`);
    
    return data.data.map((bank: any) => ({
      name: bank.name,
      code: bank.code
    }));
  } catch (error) {
    console.error("Error fetching banks:", error);
    toast.error("Could not load banks list. Please try again later.");
    return [];
  }
};

// Function to verify bank account via Supabase Edge Function
export const verifyBankAccount = async (accountNumber: string, bankCode: string): Promise<{ 
  verified: boolean; 
  accountName?: string;
  message?: string;
}> => {
  try {
    console.log(`Verifying account: ${accountNumber} with bank code: ${bankCode}`);
    
    if (!accountNumber || !bankCode) {
      console.error("Missing required fields for account verification");
      return { 
        verified: false, 
        message: "Account number and bank code are required" 
      };
    }
    
    const { data, error } = await supabase.functions.invoke("verify-account", {
      body: { accountNumber, bankCode }
    });
    
    console.log("Verification response:", data);
    
    if (error) {
      console.error("Error from supabase function:", error);
      toast.error("Account verification failed. Please try again later.");
      return { 
        verified: false, 
        message: error.message || "Verification failed" 
      };
    }
    
    if (!data.status) {
      console.error("Error response from Paystack:", data);
      toast.error(data.message || "Verification failed");
      return { 
        verified: false, 
        message: data.message || "Verification failed"
      };
    }

    if (!data.data || !data.data.account_name) {
      console.error("Missing account name in response:", data);
      return {
        verified: false,
        message: "Could not retrieve account name"
      };
    }

    toast.success("Account verified successfully!");
    return {
      verified: true,
      accountName: data.data.account_name,
      message: "Account verified successfully"
    };
  } catch (error) {
    console.error("Error verifying account:", error);
    toast.error("An error occurred during verification. Please try again.");
    return { 
      verified: false, 
      message: "An error occurred during verification" 
    };
  }
};
