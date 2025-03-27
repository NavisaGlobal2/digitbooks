
import { parseAmount } from '../../lib/parsers/helpers.ts';
import { assert } from '../helpers.ts';

Deno.test("parseAmount - correctly parses numeric values", () => {
  assert(parseAmount(100) === 100, "Should handle numeric input");
  assert(parseAmount("100") === 100, "Should handle string numeric input");
  assert(parseAmount("$100") === 100, "Should handle currency symbol");
  assert(parseAmount("100.50") === 100.5, "Should handle decimals");
  assert(parseAmount("1,000.50") === 1000.5, "Should handle commas in numbers");
  assert(parseAmount("£1,000.50") === 1000.5, "Should handle pound symbol");
  assert(parseAmount("€1,000.50") === 1000.5, "Should handle euro symbol");
  assert(parseAmount("(100.50)") === -100.5, "Should handle parentheses for negative numbers");
  assert(parseAmount("-100.50") === -100.5, "Should handle explicit negative numbers");
  assert(parseAmount("   100.50   ") === 100.5, "Should handle whitespace");
  assert(parseAmount("invalid") === 0, "Should handle invalid input");
  assert(parseAmount(null) === 0, "Should handle null");
  assert(parseAmount(undefined) === 0, "Should handle undefined");
  
  console.log("Helper functions test passed!");
});
