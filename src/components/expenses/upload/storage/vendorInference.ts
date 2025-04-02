
/**
 * Try to extract vendor name from transaction description
 */
export function inferVendorFromDescription(description: string): string {
  // Simple extraction of likely vendor name from description
  const cleanDesc = description.trim();
  
  // Look for common patterns in bank statement descriptions
  const patterns = [
    // POS pattern: "POS Purchase at VENDOR NAME"
    /(?:POS|purchase|payment)(?:\s+at|\s+to|\s+for)\s+([A-Za-z0-9\s]+)/i,
    // Transfer pattern: "Transfer to VENDOR NAME"
    /(?:transfer|sent|paid)(?:\s+to|\s+for)\s+([A-Za-z0-9\s]+)/i,
    // Debit pattern: "Debit for VENDOR NAME"
    /(?:debit|charge)(?:\s+for|\s+from|\s+to)\s+([A-Za-z0-9\s]+)/i,
    // Simple vendor after a common prefix
    /(?:pmt to|payment to|to:)\s+([A-Za-z0-9\s]+)/i
  ];
  
  // Try each pattern
  for (const pattern of patterns) {
    const match = cleanDesc.match(pattern);
    if (match && match[1]) {
      // Clean up the vendor name (first 30 chars, trim spaces)
      return match[1].trim().substring(0, 30);
    }
  }
  
  // Fallback: Use the first part of the description if no pattern matches
  // This often works because many banks put the merchant name first
  const words = cleanDesc.split(/\s+/);
  if (words.length >= 2) {
    const possibleVendor = words.slice(0, 2).join(' ');
    return possibleVendor.replace(/[^A-Za-z0-9\s]/g, '').trim().substring(0, 30);
  }
  
  // Final fallback: Use "Unknown" for really unclear descriptions
  return "Unknown Vendor";
}
