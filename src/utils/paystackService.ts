
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

// Define Supabase URL and key as constants
const SUPABASE_URL = "https://naxmgtoskeijvdofqyik.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5heG1ndG9za2VpanZkb2ZxeWlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNDI0NDMsImV4cCI6MjA1MjcxODQ0M30.HhErJymz_YynLmN9lAMcxr7JoXBR8XyH9ex1gqWVv5c";

// Paystack public key - this is a publishable key that can be used in the frontend
const PAYSTACK_PUBLIC_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Function to fetch banks from Paystack API directly
export const fetchBanks = async (): Promise<Array<{ name: string; code: string }>> => {
  try {
    console.log("Fetching banks directly from Paystack API...");
    
    const response = await fetch('https://api.paystack.co/bank', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch banks: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.status || !Array.isArray(data.data)) {
      console.error("Unexpected data format:", data);
      toast.error("Received invalid data format from Paystack API, using cached banks.");
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

// Function to verify bank account directly with Paystack API
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

    // Direct Paystack API call
    const response = await fetch(
      `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_PUBLIC_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );
    
    const data = await response.json();
    console.log("Verification response:", data);
    
    if (!response.ok) {
      toast.error(data?.message || "Verification failed");
      return { 
        verified: false, 
        message: data?.message || "Verification failed"
      };
    }
    
    if (!data.status) {
      console.error("Error response from Paystack:", data);
      toast.error(data?.message || "Verification failed");
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
