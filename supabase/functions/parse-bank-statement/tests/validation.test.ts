
import { validateFile, isValidFileSize, isValidFileType, MAX_FILE_SIZE } from '../lib/validation.ts';
import { createMockFile, assert } from './helpers.ts';

Deno.test("validateFile - rejects files that are too large", () => {
  const largeFile = createMockFile('test.csv', 'content', MAX_FILE_SIZE + 1);
  const result = validateFile(largeFile);
  assert(result !== null, "Should reject files larger than the maximum size");
  assert(result!.includes("File size exceeds"), "Should provide a helpful error message");
  
  console.log("File size validation test passed!");
});

Deno.test("validateFile - rejects unsupported file types", () => {
  const invalidFile = createMockFile('test.pdf', 'content');
  const result = validateFile(invalidFile);
  assert(result !== null, "Should reject unsupported file types");
  assert(result!.includes("Unsupported file type"), "Should provide a helpful error message");
  
  console.log("File type validation test passed!");
});

Deno.test("validateFile - accepts valid files", () => {
  const csvFile = createMockFile('test.csv', 'content');
  assert(validateFile(csvFile) === null, "Should accept CSV files");
  
  const excelFile = createMockFile('test.xlsx', 'content');
  assert(validateFile(excelFile) === null, "Should accept Excel files");
  
  console.log("Valid file validation test passed!");
});

Deno.test("isValidFileSize - correctly validates file size", () => {
  const smallFile = createMockFile('test.csv', 'content', 1000);
  assert(isValidFileSize(smallFile), "Should accept small files");
  
  const largeFile = createMockFile('test.csv', 'content', MAX_FILE_SIZE + 1);
  assert(!isValidFileSize(largeFile), "Should reject files larger than the maximum size");
  
  console.log("File size check test passed!");
});

Deno.test("isValidFileType - correctly validates file types", () => {
  const csvFile = createMockFile('test.csv', 'content');
  assert(isValidFileType(csvFile), "Should accept CSV files");
  
  const excelFile = createMockFile('test.xlsx', 'content');
  assert(isValidFileType(excelFile), "Should accept Excel files");
  
  const pdfFile = createMockFile('test.pdf', 'content');
  assert(!isValidFileType(pdfFile), "Should reject PDF files");
  
  console.log("File type check test passed!");
});
