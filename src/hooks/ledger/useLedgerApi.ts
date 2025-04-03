
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/ledger";
import { toast } from "sonner";

// Function to fetch transactions from the database
export async function fetchTransactionsFromApi(): Promise<{
  transactions: Transaction[];
  error: Error | null;
}> {
  try {
    console.log("Starting to fetch transactions from API");
    
    // Get current user session to filter by user_id
    console.log("Getting user session...");
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      throw sessionError;
    }
    
    const userId = session?.user?.id;
    console.log("Current user ID:", userId);
    
    if (!userId) {
      console.error("User not authenticated");
      return {
        transactions: [],
        error: new Error("User not authenticated")
      };
    }
    
    // Using the generic "from" method with user_id filter
    console.log(`Querying ledger_transactions for user_id: ${userId}`);
    const { data, error } = await supabase
      .from("ledger_transactions")
      .select("*")
      .eq("user_id", userId) // Add filter by user_id
      .order("date", { ascending: false }) as { data: any[], error: any };

    console.log("Query result:", { data, error });

    if (error) {
      console.error("Database query error:", error);
      throw error;
    }
    
    // Check if we got data back
    if (!data || data.length === 0) {
      console.log("No transactions found for this user");
    } else {
      console.log(`Found ${data.length} transactions`);
    }
    
    // Transform the data into our Transaction format
    const formattedTransactions: Transaction[] = data.map((item: any) => ({
      id: item.id,
      date: new Date(item.date),
      description: item.description,
      amount: Number(item.amount),
      type: item.type,
      category: item.category
    }));
    
    console.log("Formatted transactions:", formattedTransactions);
    return { transactions: formattedTransactions, error: null };
  } catch (error: any) {
    console.error("Error fetching transactions:", error.message);
    return { transactions: [], error };
  }
}

// Function to add a new transaction
export async function addTransactionToApi(transaction: Omit<Transaction, "id">): Promise<Transaction | null> {
  try {
    // Format the date for Supabase - convert Date object to ISO string and extract the date part
    const formattedDate = transaction.date instanceof Date 
      ? transaction.date.toISOString().split('T')[0] 
      : transaction.date;

    // Get current user
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // First insert the transaction into the database
    const { data, error } = await supabase
      .from("ledger_transactions")
      .insert({
        date: formattedDate,
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        user_id: userId
      })
      .select() as { data: any[], error: any };

    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      throw new Error("No data returned after insert");
    }
    
    // Return the new transaction
    const newTransaction: Transaction = {
      id: data[0].id,
      date: new Date(data[0].date),
      description: data[0].description,
      amount: Number(data[0].amount),
      type: data[0].type,
      category: data[0].category
    };
    
    return newTransaction;
  } catch (error: any) {
    console.error("Error adding transaction:", error.message);
    toast.error("Failed to add transaction");
    throw error;
  }
}

// Function to update an existing transaction
export async function updateTransactionInApi(id: string, updates: Partial<Transaction>): Promise<void> {
  try {
    // Format updates for the database
    const dbUpdates: any = { ...updates };
    
    // If date is a Date object, ensure it's formatted correctly for the database
    if (updates.date instanceof Date) {
      dbUpdates.date = updates.date.toISOString().split('T')[0];
    }
    
    // Update the transaction in the database
    const { error } = await supabase
      .from("ledger_transactions")
      .update(dbUpdates)
      .eq("id", id) as { error: any };

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error("Error updating transaction:", error.message);
    toast.error("Failed to update transaction");
    throw error;
  }
}

// Function to delete a transaction
export async function deleteTransactionFromApi(id: string): Promise<void> {
  try {
    // Delete the transaction from the database
    const { error } = await supabase
      .from("ledger_transactions")
      .delete()
      .eq("id", id) as { error: any };

    if (error) {
      throw error;
    }
  } catch (error: any) {
    console.error("Error deleting transaction:", error.message);
    toast.error("Failed to delete transaction");
    throw error;
  }
}
