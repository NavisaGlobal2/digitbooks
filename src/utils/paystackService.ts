
import { toast } from "sonner";

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

// API URLs for Paystack
const PAYSTACK_BASE_URL = "https://api.paystack.co";
// NOTE: For security reasons, you should use a server-side function for verification
// This is a public key used for testing purposes only
const PAYSTACK_TEST_KEY = "pk_test_26c38517b9acc3ea73ec4efe7b4cc6f6df7192f3";

// Function to fetch banks directly from Paystack API
export const fetchBanks = async (): Promise<Array<{ name: string; code: string }>> => {
  try {
    console.log("Fetching banks directly from Paystack API...");
    
    const response = await fetch(`${PAYSTACK_BASE_URL}/bank`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_TEST_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to fetch banks: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Failed to fetch banks: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.status || !Array.isArray(data.data)) {
      console.error("Unexpected data format:", data);
      toast.error("Failed to load banks. Using cached list.");
      return FALLBACK_BANKS;
    }
    
    console.log(`Successfully fetched ${data.data.length} banks`);
    
    // Filter to only Nigerian banks if needed
    return data.data
      .filter((bank: any) => bank.country === "Nigeria")
      .map((bank: any) => ({
        name: bank.name,
        code: bank.code
      }));
  } catch (error) {
    console.error("Error fetching banks:", error);
    toast.error("Using cached bank list due to connection issues.");
    return FALLBACK_BANKS;
  }
};

// Function to verify bank account directly using Paystack API
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

    // Using cors-anywhere to bypass CORS issues in development
    // In production, this should be handled by your backend
    const apiUrl = `${PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`;
    console.log("Making API request to:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_TEST_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log("Verification response:", data);
    
    if (!response.ok || !data.status) {
      return { 
        verified: false, 
        message: data.message || "Verification failed" 
      };
    }

    if (!data.data || !data.data.account_name) {
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
      message: "An error occurred during verification. This might be due to CORS restrictions. In a production app, this would be handled by your backend." 
    };
  }
};
