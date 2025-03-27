
// Helpers for testing

/**
 * Create a mock File object for testing purposes
 */
export function createMockFile(name: string, content: string, size?: number): File {
  const blob = new Blob([content], { type: getTypeByExtension(name) });
  const file = new File([blob], name, { type: getTypeByExtension(name) });
  
  // Override the size property if provided
  if (size !== undefined) {
    Object.defineProperty(file, 'size', {
      value: size,
      writable: false
    });
  }
  
  return file;
}

/**
 * Generate a mock CSV content for testing
 */
export function generateMockCSV(): string {
  return `Date,Description,Amount,Type
2023-01-01,"Coffee Shop",-4.50,debit
2023-01-02,"Salary",2500.00,credit
2023-01-03,"Grocery Store",-65.20,debit`;
}

/**
 * Get the MIME type based on file extension
 */
function getTypeByExtension(filename: string): string {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'csv':
      return 'text/csv';
    case 'xlsx':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls':
      return 'application/vnd.ms-excel';
    case 'pdf':
      return 'application/pdf';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Mock Supabase client for testing
 */
export class MockSupabaseClient {
  auth = {
    getUser: async () => ({
      data: { user: { id: 'test-user-id' } },
      error: null
    })
  };
  
  from = () => this;
  
  insert = () => ({
    error: null
  });
}

/**
 * Simple assertion function
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}
