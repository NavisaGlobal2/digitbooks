
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Interface for the account verification request
interface VerifyAccountRequest {
  account_number: string;
  bank_code: string;
}

// Interface for the account verification response
interface VerifyAccountResponse {
  status: boolean;
  message: string;
  data?: {
    account_number: string;
    account_name: string;
    bank_id: number;
  };
}

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
      throw new Error(error.message);
    }
    
    if (!data.status) {
      console.error("Error response from Paystack:", data);
      throw new Error(data.message || "Failed to fetch banks");
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
    
    const { data, error } = await supabase.functions.invoke("verify-account", {
      body: { accountNumber, bankCode }
    });
    
    console.log("Verification response:", data);
    
    if (error) {
      console.error("Error from supabase function:", error);
      return { 
        verified: false, 
        message: error.message || "Verification failed" 
      };
    }
    
    if (!data.status || !data.data) {
      console.error("Error response from Paystack:", data);
      return { 
        verified: false, 
        message: data.message || "Verification failed"
      };
    }

    return {
      verified: true,
      accountName: data.data.account_name,
      message: "Account verified successfully"
    };
  } catch (error) {
    console.error("Error verifying account:", error);
    return { 
      verified: false, 
      message: "An error occurred during verification" 
    };
  }
};
