
import { parseDate } from '../../lib/parsers/utils/dateUtils.ts';
import { assert } from '../helpers.ts';

Deno.test("parseDate - correctly parses date values", () => {
  // Test ISO format
  const isoDate = parseDate("2023-04-15");
  assert(isoDate !== null, "Should parse ISO date format");
  assert(isoDate?.toISOString().startsWith("2023-04-15"), "ISO date should be correctly parsed");

  // Test MM/DD/YYYY format
  const usDate = parseDate("04/15/2023");
  assert(usDate !== null, "Should parse US date format");
  assert(usDate?.toISOString().startsWith("2023-04-15"), "US date should be correctly parsed");

  // Test DD/MM/YYYY format
  const ukDate = parseDate("15/04/2023");
  assert(ukDate !== null, "Should parse UK date format");
  assert(ukDate?.toISOString().startsWith("2023-04-15"), "UK date should be correctly parsed");

  // Test month name format
  const textDate = parseDate("15 Apr 2023");
  assert(textDate !== null, "Should parse text month format");
  assert(textDate?.toISOString().startsWith("2023-04-15"), "Text month date should be correctly parsed");

  // Test invalid formats
  assert(parseDate("not a date") === null, "Should return null for invalid dates");
  assert(parseDate("") === null, "Should return null for empty string");
  assert(parseDate(null) === null, "Should return null for null value");

  console.log("Date parsing tests passed!");
});
