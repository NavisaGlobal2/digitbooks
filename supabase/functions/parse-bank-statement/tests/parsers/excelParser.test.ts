
import { processExcel } from '../../lib/parsers/excelParser.ts';
import { assert } from '../helpers.ts';

// Mock File for testing
function createMockExcelFile(name: string, content: Uint8Array | string): File {
  // Create a simple Excel-like binary structure
  const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  return new File([blob], name);
}

Deno.test("Excel Parser - should handle binary Excel files", async () => {
  // Create a basic mock Excel file
  // This is just a simplified test that verifies our parser doesn't throw exceptions
  // We're not testing the actual Excel parsing since we're using a simplified implementation
  
  // Create a mock file with some byte patterns that should be detected as text
  const mockContent = new Uint8Array([
    // ASCII 'D', 'a', 't', 'e' with zero bytes in between (UTF-16LE encoding)
    68, 0, 97, 0, 116, 0, 101, 0, 0, 0,
    // ASCII 'D', 'e', 's', 'c' with zero bytes in between
    68, 0, 101, 0, 115, 0, 99, 0, 0, 0,
    // ASCII 'A', 'm', 'o', 'u', 'n', 't' with zero bytes in between
    65, 0, 109, 0, 111, 0, 117, 0, 110, 0, 116, 0, 0, 0,
    // Newline character
    13, 0, 10, 0,
    // Row 1: '2', '0', '2', '3', '-', '0', '1', '-', '0', '1' (date)
    50, 0, 48, 0, 50, 0, 51, 0, 45, 0, 48, 0, 49, 0, 45, 0, 48, 0, 49, 0, 0, 0,
    // Tab character
    9, 0,
    // 'G', 'r', 'o', 'c', 'e', 'r', 'y' (description)
    71, 0, 114, 0, 111, 0, 99, 0, 101, 0, 114, 0, 121, 0, 0, 0,
    // Tab character
    9, 0,
    // '-', '1', '0', '0', '.', '0', '0' (amount)
    45, 0, 49, 0, 48, 0, 48, 0, 46, 0, 48, 0, 48, 0, 0, 0
  ]);

  const file = createMockExcelFile('test.xlsx', mockContent);
  
  try {
    // We're not testing the actual parsing logic here, just that it doesn't throw exceptions
    const result = await processExcel(file);
    
    // Just assert that we got some kind of result
    assert(Array.isArray(result), "Result should be an array");
    console.log("Excel parser test passed!");
  } catch (error) {
    console.error("Excel parser test failed:", error);
    throw error;
  }
});
