
// Test runner for parse-bank-statement edge function tests

console.log("=== Running parse-bank-statement tests ===");

// Import all test files
import './parsers/helpers.test.ts';
import './parsers/dateUtils.test.ts';
import './parsers/csvParser.test.ts';
import './parsers/transactionDetector.test.ts';
import './parsers/excelParser.test.ts'; // Add this line to test our new Excel parser
import './database.test.ts';
import './formProcessor.test.ts';
import './validation.test.ts';
import './integration.test.ts';

console.log("=== All tests completed ===");
