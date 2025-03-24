
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Mock data for fallback (only used when API fails)
const FALLBACK_BANKS = [
  { name: "Access Bank", code: "044" },
  { name: "Zenith Bank", code: "057" },
  { name: "First Bank of Nigeria", code: "011" },
  { name: "Guaranty Trust Bank", code: "058" },
  { name: "United Bank for Africa", code: "033" },
  { name: "Fidelity Bank", code: "070" },
  { name: "Union Bank", code: "032" },
  { name: "Sterling Bank", code: "232" },
  { name: "Wema Bank", code: "035" },
  { name: "Ecobank", code: "050" }
];

// Function to fetch banks from our Supabase Edge Function
export const fetchBanks = async (): Promise<Array<{ name: string; code: string }>> => {
  try {
    console.log("Fetching banks from Supabase Edge Function...");
    
    const { data, error } = await supabase.functions.invoke('list-banks', {
      method: 'GET'
    });
    
    if (error) {
      throw new Error(`Failed to fetch banks: ${error.message}`);
    }
    
    if (!data.status || !Array.isArray(data.data)) {
      console.error("Unexpected data format:", data);
      toast.error("Received invalid data format from API, using cached banks.");
      return FALLBACK_BANKS;
    }
    
    console.log(`Successfully fetched ${data.data.length} banks`);
    
    return data.data.map((bank: any) => ({
      name: bank.name,
      code: bank.code
    }));
  } catch (error) {
    console.error("Error fetching banks:", error);
    toast.error("Using cached bank list due to connection issues.");
    return FALLBACK_BANKS;
  }
};

// Function to verify bank account using our Supabase Edge Function
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

    // Call our Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('verify-account', {
      method: 'POST',
      body: { accountNumber, bankCode }
    });
    
    if (error) {
      console.error("Error from Edge Function:", error);
      return { 
        verified: false, 
        message: error.message || "Verification failed"
      };
    }
    
    console.log("Verification response:", data);
    
    if (!data.status) {
      console.error("Error response from API:", data);
      return { 
        verified: false, 
        message: data?.message || "Verification failed"
      };
    }

    if (!data.data || !data.data.account_name) {
      console.error("Missing account name in response:", data);
      return {
        verified: false,
        message: "Could not retrieve account name"
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
