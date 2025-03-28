
import { detectAndParseTransactions } from '../../lib/parsers/transactionDetector.ts';
import { assert } from '../helpers.ts';

Deno.test("detectAndParseTransactions - handles CSV data format", () => {
  const rows = [
    ["Date", "Description", "Amount"],
    ["2023-01-01", "Transaction 1", "100.00"],
    ["2023-01-02", "Transaction 2", "-50.25"],
    ["2023-01-03", "Transaction 3", "250"]
  ];
  
  const transactions = detectAndParseTransactions(rows);
  
  assert(transactions.length === 3, "Should parse 3 transactions");
  
  // Check the date format
  assert(transactions[0].date.match(/^\d{4}-\d{2}-\d{2}$/), "Date should be in YYYY-MM-DD format");
  
  // Check transaction types
  const creditTransactions = transactions.filter(t => t.type === 'credit');
  const debitTransactions = transactions.filter(t => t.type === 'debit');
  
  assert(creditTransactions.length === 2, "Should have 2 credit transactions");
  assert(debitTransactions.length === 1, "Should have 1 debit transaction");
  
  // Check amount calculations
  assert(transactions[0].amount === 100, "First transaction amount should be 100");
  assert(transactions[1].amount === 50.25, "Second transaction amount should be 50.25 (absolute value)");
  assert(transactions[2].amount === 250, "Third transaction amount should be 250");
  
  console.log("Transaction detector test passed!");
});

Deno.test("detectAndParseTransactions - handles different column formats", () => {
  // Format with debit/credit in separate columns
  const separateColumnsRows = [
    ["Date", "Description", "Debit", "Credit"],
    ["2023-01-01", "Debit Transaction", "100.00", ""],
    ["2023-01-02", "Credit Transaction", "", "50.25"]
  ];
  
  const transactions1 = detectAndParseTransactions(separateColumnsRows);
  assert(transactions1.length === 2, "Should parse 2 transactions from separate columns");
  assert(transactions1[0].type === 'debit', "First transaction should be debit");
  assert(transactions1[1].type === 'credit', "Second transaction should be credit");
  
  // Format with transaction type determined by negative/positive values
  const signedValueRows = [
    ["Date", "Description", "Transaction Amount"],
    ["2023-01-01", "Debit Transaction", "-100.00"],
    ["2023-01-02", "Credit Transaction", "50.25"]
  ];
  
  const transactions2 = detectAndParseTransactions(signedValueRows);
  assert(transactions2.length === 2, "Should parse 2 transactions from signed values");
  assert(transactions2[0].type === 'debit', "First transaction should be debit");
  assert(transactions2[1].type === 'credit', "Second transaction should be credit");
  
  console.log("Transaction detector format handling test passed!");
});

Deno.test("detectAndParseTransactions - handles uncommon column names", () => {
  // Test with non-standard column names
  const nonStandardHeadersRows = [
    ["Transaction Time", "Narrative", "Value"],
    ["01/15/2023", "Unusual transaction description", "100.00"],
    ["01/20/2023", "Another strange narrative", "-75.50"]
  ];
  
  const transactions = detectAndParseTransactions(nonStandardHeadersRows);
  assert(transactions.length === 2, "Should parse 2 transactions with non-standard headers");
  assert(transactions[0].description === "Unusual transaction description", "Should correctly map narrative to description");
  assert(transactions[1].amount === 75.5, "Should correctly map value to amount");
  
  console.log("Transaction detector uncommon column names test passed!");
});

Deno.test("detectAndParseTransactions - handles data without clear headers", () => {
  // Data without clear header row
  const noHeaderRows = [
    ["01/15/2023", "First transaction", "100.00"],
    ["01/20/2023", "Second transaction", "-75.50"],
    ["01/25/2023", "Third transaction", "200.00"]
  ];
  
  const transactions = detectAndParseTransactions(noHeaderRows);
  assert(transactions.length > 0, "Should extract transactions even without clear headers");
  
  console.log("Transaction detector headerless data test passed!");
});
