
/**
 * Helper functions for extracting and formatting descriptions from transactions
 */

/**
 * Helper function to extract description from transaction
 */
export function extractDescription(tx: any): string {
  // First try to use the AI-formatted description if available
  if (tx.description && typeof tx.description === 'string' && tx.description.trim()) {
    return tx.description;
  }
  
  if (tx.preservedColumns) {
    // Try common description fields
    const possibleDescFields = [
      "NARRATION", 
      "Description", 
      "PARTICULARS", 
      "__EMPTY", 
      "Remarks", 
      "Transaction Description",
      "Narrative",
      "Details",
      "Reference",
      "To / From"
    ];
    
    for (const field of possibleDescFields) {
      if (tx.preservedColumns[field] && typeof tx.preservedColumns[field] === 'string') {
        return tx.preservedColumns[field].trim();
      }
    }
    
    // Try to combine fields if there's no single description field
    let combinedDesc = "";
    
    // Often transaction descriptions are split across multiple fields
    if (tx.preservedColumns["To / From"] && typeof tx.preservedColumns["To / From"] === 'string') {
      combinedDesc += tx.preservedColumns["To / From"].trim() + " - ";
    }
    
    if (tx.preservedColumns["Category"] && typeof tx.preservedColumns["Category"] === 'string') {
      combinedDesc += tx.preservedColumns["Category"].trim();
    }
    
    if (combinedDesc) {
      return combinedDesc;
    }
  }
  
  return "Unknown transaction";
}
