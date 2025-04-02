
import { ParsedTransaction } from "./parsers/types";
import { Expense, ExpenseStatus, ExpenseCategory } from "@/types/expense";
import { v4 as uuidv4 } from "uuid";
import { saveTransactionsToDatabase } from "./storage/databaseOperations";
import { inferVendorFromDescription } from "./storage/vendorInference";

export { saveTransactionsToDatabase } from "./storage/databaseOperations";
export { prepareExpensesFromTransactions } from "./storage/expensePreparation";

// Re-export the inferVendorFromDescription function to make it available
export { inferVendorFromDescription } from "./storage/vendorInference";
