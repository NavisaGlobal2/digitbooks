
// Helper functions for tests

/**
 * Create a mock File object for testing
 */
export function createMockFile(
  filename: string, 
  content: string, 
  type = 'text/csv'
): File {
  const blob = new Blob([content], { type });
  return new File([blob], filename, { type });
}

/**
 * Generate a mock CSV content
 */
export function generateMockCSV(): string {
  return `Date,Description,Debit,Credit
2023-01-01,"Salary deposit",,5000.00
2023-01-05,"Grocery store",-120.50,
2023-01-10,"Phone bill",-55.99,
2023-01-15,"ATM withdrawal",-200.00,
2023-01-20,"Online purchase",-89.99,`;
}

/**
 * Generate a mock Excel content
 * This is a simplification since we can't easily create Excel binary data directly
 * In a real test, we might load a fixture file
 */
export function generateMockExcelRows(): any[][] {
  return [
    ["Date", "Description", "Debit", "Credit"],
    ["2023-01-01", "Salary deposit", null, 5000.00],
    ["2023-01-05", "Grocery store", -120.50, null],
    ["2023-01-10", "Phone bill", -55.99, null],
    ["2023-01-15", "ATM withdrawal", -200.00, null],
    ["2023-01-20", "Online purchase", -89.99, null]
  ];
}

/**
 * Create a mock Request object
 */
export function createMockRequest(
  method: string,
  body?: FormData | null,
  headers: Record<string, string> = {}
): Request {
  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers)
  };
  
  if (body && method !== 'GET' && method !== 'HEAD') {
    requestInit.body = body;
  }
  
  return new Request('https://example.com/parse-bank-statement', requestInit);
}

/**
 * Mock Supabase client functionalities
 */
export class MockSupabaseClient {
  auth = {
    getUser: async () => ({
      data: {
        user: { id: 'test-user-id' }
      },
      error: null
    })
  };
  
  from = (table: string) => ({
    insert: async (data: any) => ({
      error: null,
      data: data
    })
  });
}

export class MockFormData {
  private data: Map<string, any> = new Map();
  
  append(name: string, value: any): void {
    this.data.set(name, value);
  }
  
  get(name: string): any {
    return this.data.get(name);
  }
}

/**
 * Assert a condition and throw if it fails
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
