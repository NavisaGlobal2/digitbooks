
import { processCSV } from '../../lib/parsers/csvParser.ts';
import { createMockFile, generateMockCSV, assert } from '../helpers.ts';

Deno.test("processCSV - parses CSV data correctly", async () => {
  // Create a mock CSV file
  const csvContent = generateMockCSV();
  const mockFile = createMockFile('test.csv', csvContent);
  
  // Process the CSV
  const transactions = await processCSV(mockFile);
  
  // Assertions
  assert(Array.isArray(transactions), "Transactions should be an array");
  assert(transactions.length === 5, "Should have 5 transactions from our mock data");
  
  // Check transaction structure for the first item
  const firstTransaction = transactions[0];
  assert(typeof firstTransaction.date === 'string', "Transaction date should be a string");
  assert(typeof firstTransaction.description === 'string', "Transaction description should be a string");
  assert(typeof firstTransaction.amount === 'number', "Transaction amount should be a number");
  assert(['debit', 'credit', 'unknown'].includes(firstTransaction.type), "Transaction type should be valid");
  
  // Specific checks for credit transaction
  const creditTransaction = transactions.find(t => t.type === 'credit');
  assert(creditTransaction !== undefined, "Should have at least one credit transaction");
  assert(creditTransaction!.amount > 0, "Credit transaction amount should be positive");
  
  // Specific checks for debit transaction
  const debitTransaction = transactions.find(t => t.type === 'debit');
  assert(debitTransaction !== undefined, "Should have at least one debit transaction");
  assert(debitTransaction!.amount > 0, "Debit transaction amount should be a positive number");
  
  console.log("CSV Parser test passed!");
});
