
import { toast } from "sonner";

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

// Function to fetch banks from Paystack API
export const fetchBanks = async (): Promise<Array<{ name: string; code: string }>> => {
  try {
    const response = await fetch("https://api.paystack.co/bank", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error("Failed to fetch banks");
    }

    const data: BankListResponse = await response.json();
    
    if (!data.status) {
      throw new Error(data.message);
    }

    return data.data.map(bank => ({
      name: bank.name,
      code: bank.code
    }));
  } catch (error) {
    console.error("Error fetching banks:", error);
    toast.error("Could not load banks list");
    return [];
  }
};

// Function to verify bank account
export const verifyBankAccount = async (accountNumber: string, bankCode: string): Promise<{ 
  verified: boolean; 
  accountName?: string;
  message?: string;
}> => {
  try {
    const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${import.meta.env.VITE_PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        verified: false, 
        message: errorData.message || "Verification failed" 
      };
    }

    const data: VerifyAccountResponse = await response.json();
    
    if (!data.status || !data.data) {
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
