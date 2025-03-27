
import { saveToDatabase } from '../lib/database.ts';
import { Transaction } from '../lib/types.ts';
import { assert } from './helpers.ts';

// Mock Supabase client
const mockSupabaseAdmin = {
  from: (table: string) => ({
    insert: (data: any) => ({
      error: null,
      data
    })
  })
};

Deno.test("saveToDatabase - saves transactions in batches", async () => {
  // Create a bunch of test transactions
  const transactions: Transaction[] = [];
  for (let i = 0; i < 75; i++) {
    transactions.push({
      date: '2023-01-01',
      description: `Test Transaction ${i}`,
      amount: 100 + i,
      type: i % 2 === 0 ? 'credit' : 'debit'
    });
  }
  
  // Test with our mock client
  let insertCallCount = 0;
  let totalItemsInserted = 0;
  
  const testClient = {
    from: (table: string) => ({
      insert: (data: any) => {
        insertCallCount++;
        totalItemsInserted += data.length;
        return { error: null };
      }
    })
  };
  
  const savedCount = await saveToDatabase(
    transactions,
    'test-batch-id',
    'test-user-id',
    'https://example.com',
    'fake-key',
    testClient as any
  );
  
  // With 75 transactions and batch size of 50, we should have 2 insert calls
  assert(insertCallCount === 2, "Should have made 2 insert calls for 75 transactions with batch size 50");
  assert(totalItemsInserted === 75, "Should have inserted all 75 transactions");
  assert(savedCount === 75, "Should return correct saved count");
  
  // Test empty transactions array
  const emptyResult = await saveToDatabase(
    [],
    'test-batch-id',
    'test-user-id',
    'https://example.com',
    'fake-key',
    testClient as any
  );
  
  assert(emptyResult === 0, "Should handle empty transactions array");
  
  console.log("Database functions test passed!");
});
