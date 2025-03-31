
import { ExpenseCategory } from "@/types/expense";
import { ParsedTransaction } from "../parsers/types";

interface CategorySuggestion {
  category: ExpenseCategory;
  confidence: number;
}

// Common keywords associated with different expense categories
const CATEGORY_KEYWORDS: Record<ExpenseCategory, string[]> = {
  office: ["office", "supplies", "printer", "paper", "staples", "stationary", "ink", "toner"],
  travel: ["flight", "hotel", "taxi", "uber", "lyft", "airbnb", "train", "rental car", "airline", "booking", "travel"],
  meals: ["restaurant", "cafe", "coffee", "lunch", "dinner", "breakfast", "food", "catering", "doordash", "ubereats"],
  utilities: ["electric", "water", "gas", "internet", "phone", "bill", "utility", "broadband", "telecom", "energy"],
  rent: ["rent", "lease", "property", "office space", "real estate", "building", "landlord"],
  software: ["software", "subscription", "saas", "license", "cloud", "app", "digital", "online service"],
  hardware: ["computer", "laptop", "server", "monitor", "keyboard", "mouse", "router", "hardware", "device", "electronics"],
  marketing: ["advertising", "ads", "promotion", "campaign", "facebook ad", "google ad", "marketing", "social media"],
  salaries: ["salary", "payroll", "wages", "compensation", "bonus", "commission", "hr", "employee", "staff"],
  taxes: ["tax", "duty", "vat", "gst", "income tax", "corporation tax", "irs", "hmrc", "government"],
  other: [] // Catch-all category - will be used if nothing else matches
};

/**
 * Suggests a category based on transaction description
 */
export const suggestCategory = (description: string): CategorySuggestion => {
  if (!description) {
    return { category: "other", confidence: 0 };
  }
  
  const lowerDesc = description.toLowerCase();
  let bestMatch: ExpenseCategory = "other";
  let highestConfidence = 0;
  
  // Check each category's keywords for matches
  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    // Skip the "other" category as it's our fallback
    if (category === "other") return;
    
    // Calculate how many keywords match
    const matchingKeywords = keywords.filter(keyword => lowerDesc.includes(keyword.toLowerCase()));
    
    // If we have matching keywords, calculate a confidence score
    if (matchingKeywords.length > 0) {
      // Base confidence on the number and specificity of matches
      // Here we use a simple heuristic: length of matched keywords / description length
      const matchStrength = matchingKeywords.reduce((sum, keyword) => sum + keyword.length, 0) / lowerDesc.length;
      const confidence = Math.min(0.95, matchStrength * 3); // Cap at 95% confidence
      
      if (confidence > highestConfidence) {
        highestConfidence = confidence;
        bestMatch = category as ExpenseCategory;
      }
    }
  });
  
  // Apply domain-specific rules for special cases
  if (lowerDesc.includes("amazon") && highestConfidence < 0.7) {
    // Amazon could be office supplies or hardware, depending on context
    bestMatch = "office";
    highestConfidence = Math.max(0.6, highestConfidence);
  }
  
  // If confidence is too low, just return "other"
  if (highestConfidence < 0.4) {
    bestMatch = "other";
    highestConfidence = 0.4; // Set a minimum confidence for "other"
  }
  
  return {
    category: bestMatch,
    confidence: parseFloat(highestConfidence.toFixed(2)) // Round to 2 decimal places
  };
};

/**
 * Process an array of transactions and add category suggestions to them
 */
export const addCategorySuggestions = (transactions: ParsedTransaction[]): ParsedTransaction[] => {
  return transactions.map(transaction => {
    // Only suggest categories for debit transactions (expenses)
    if (transaction.type === 'debit') {
      const suggestion = suggestCategory(transaction.description);
      
      return {
        ...transaction,
        category: transaction.category || suggestion.category, // Keep existing category if present
        categorySuggestion: suggestion,
      };
    }
    return transaction;
  });
};
