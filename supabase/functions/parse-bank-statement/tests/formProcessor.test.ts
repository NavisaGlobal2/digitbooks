
import { processFormData } from '../lib/formProcessor.ts';
import { Transaction } from '../lib/types.ts';
import { createMockFile, generateMockCSV, MockSupabaseClient, assert } from './helpers.ts';

Deno.test("processFormData - processes form data correctly", async () => {
  // Create a mock form with a CSV file
  const formData = new FormData();
  const csvContent = generateMockCSV();
  const mockFile = createMockFile('test.csv', csvContent);
  formData.append('file', mockFile);
  
  // Mock the parseFile function that will be called inside processFormData
  const originalParseFile = globalThis.parseFile;
  globalThis.parseFile = async (file: File): Promise<Transaction[]> => {
    return [
      {
        date: '2023-01-01',
        description: 'Test Transaction',
        amount: 100,
        type: 'credit'
      }
    ];
  };
  
  try {
    // Create a mock request with the form data
    const request = new Request('https://example.com', {
      method: 'POST',
      body: formData
    });
    
    // Create a mock Supabase client
    const mockSupabase = new MockSupabaseClient();
    
    // Process the form data
    const result = await processFormData(
      request, 
      'fake-token',
      'https://example.com',
      undefined, // Use the mock parseFile function
      mockSupabase as any
    );
    
    // Assertions
    assert(result.transactions.length === 1, "Should have 1 transaction");
    assert(result.user.id === 'test-user-id', "Should have user ID");
    assert(typeof result.batchId === 'string', "Should have batch ID");
    
    const transaction = result.transactions[0];
    assert(transaction.date === '2023-01-01', "Transaction date should match");
    assert(transaction.description === 'Test Transaction', "Transaction description should match");
    assert(transaction.amount === 100, "Transaction amount should match");
    assert(transaction.type === 'credit', "Transaction type should match");
    
    console.log("Form processor test passed!");
  } finally {
    // Restore the original parseFile function
    globalThis.parseFile = originalParseFile;
  }
});

Deno.test("processFormData - handles errors", async () => {
  // Create a form data without a file
  const formData = new FormData();
  
  // Create a mock request with the form data
  const request = new Request('https://example.com', {
    method: 'POST',
    body: formData
  });
  
  // Create a mock Supabase client
  const mockSupabase = new MockSupabaseClient();
  
  try {
    await processFormData(
      request, 
      'fake-token',
      'https://example.com',
      undefined,
      mockSupabase as any
    );
    assert(false, "Should have thrown an error");
  } catch (error) {
    assert(error.message.includes("No file uploaded"), "Should throw appropriate error message");
    console.log("Form processor error handling test passed!");
  }
});
