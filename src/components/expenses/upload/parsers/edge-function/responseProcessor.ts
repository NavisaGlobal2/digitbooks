
import { ParsedTransaction } from "../types";
import { trackFailedConnection } from "./connectionStats";

/**
 * Process a successful response from the edge function
 */
export const processSuccessfulResult = (
  result: any, 
  onSuccess: (transactions: ParsedTransaction[]) => void
): boolean => {
  console.log("🔄 STEP 6: Processing edge function result");
  console.log("Edge function result:", result);
  
  // Add detailed diagnostic logging 
  if (result.diagnostics) {
    console.log("🔍 STEP 6.1: Server Diagnostics:", result.diagnostics);
    
    // Check for explicit Vision API data
    if (result.diagnostics.visionApiStatus) {
      console.log(`🔍 STEP 6.2: Vision API Status: ${result.diagnostics.visionApiStatus}`);
    }
    
    // Log extracted text preview if available
    if (result.diagnostics.extractedText) {
      console.log(`🔍 STEP 6.3: Text extraction sample: ${result.diagnostics.extractedText.substring(0, 200)}...`);
    }
    
    // Log any specific error messages
    if (result.diagnostics.errorDetails) {
      console.error(`❌ STEP 6.4: Server processing error: ${result.diagnostics.errorDetails}`);
    }
  }
  
  if (!result.success) {
    console.error("❌ STEP 6.5: Edge function returned error");
    trackFailedConnection('processing_error', new Error(result.error || "Unknown processing error"));
    console.error("❌ Edge function returned error:", result.error);
    throw new Error(result.error || "Unknown error processing file");
  }
  
  // Check for diagnostic data that might have been returned for debugging
  if (result.diagnostics) {
    if (result.diagnostics.visionApiStatus && result.diagnostics.visionApiStatus !== 200) {
      console.error(`❌ STEP 6.6: Google Vision API returned status: ${result.diagnostics.visionApiStatus}`);
      throw new Error(`Google Vision API returned status: ${result.diagnostics.visionApiStatus}`);
    }
    
    if (result.diagnostics.errorDetails) {
      console.error(`❌ STEP 6.7: Vision API error details: ${result.diagnostics.errorDetails}`);
      throw new Error(`Google Vision API error: ${result.diagnostics.errorDetails}`);
    }
  }
  
  if (!result.transactions || !Array.isArray(result.transactions)) {
    console.log("⚠️ STEP 6.8: No transactions found or invalid transactions array");
    
    // Add diagnostics about what was received instead
    if (result.text) {
      console.log("📝 STEP 6.9: Received text data instead of transactions. First 200 chars:", result.text.substring(0, 200));
      console.log("This indicates the text was extracted but not properly parsed into transactions");
    }
    
    onSuccess([]);
    return true;
  }
  
  if (result.transactions.length === 0) {
    console.log("⚠️ STEP 6.10: Empty transactions array returned - no transactions found");
    
    // Log if text extraction was successful but parsing failed
    if (result.text || (result.diagnostics && result.diagnostics.extractedText)) {
      console.log("📝 STEP 6.11: Text was extracted but no transactions were identified");
    }
    
    onSuccess([]);
    return true;
  }
  
  console.log(`✅ STEP 6.12: Successfully parsed ${result.transactions.length} transactions`);
  
  // Process the transactions
  const transactions: ParsedTransaction[] = result.transactions.map((tx: any) => ({
    id: `tx-${Math.random().toString(36).substr(2, 9)}`,
    date: tx.date,
    description: tx.description,
    amount: tx.amount,
    type: tx.type || (tx.amount < 0 ? "debit" : "credit"),
    selected: tx.type === "debit", // Pre-select debits by default
    category: tx.category || "",
    source: tx.source || ""
  }));
  
  // Filter out any transactions with missing required fields
  const validTransactions = transactions.filter(tx => {
    // Ensure we have valid date
    const hasValidDate = tx.date && String(tx.date).trim() !== '';
    
    // Ensure we have valid description
    const hasValidDescription = tx.description && String(tx.description).trim() !== '';
    
    // Ensure we have valid amount
    const hasValidAmount = tx.amount !== undefined && 
                           tx.amount !== null && 
                           !isNaN(parseFloat(String(tx.amount)));
    
    if (!hasValidDate || !hasValidDescription || !hasValidAmount) {
      console.log(`⚠️ STEP 6.13: Filtering out invalid transaction: ${JSON.stringify(tx)}`);
      return false;
    }
    
    return true;
  });
  
  console.log(`✅ STEP 6.14: After validation: ${validTransactions.length} of ${transactions.length} transactions are valid`);
  
  // Log the first few transactions for debugging
  if (validTransactions.length > 0) {
    console.log("📊 STEP 6.15: Sample transactions:", validTransactions.slice(0, 3));
  }
  
  onSuccess(validTransactions);
  return true;
};
