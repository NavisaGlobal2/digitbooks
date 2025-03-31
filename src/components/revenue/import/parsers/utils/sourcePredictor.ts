
import { RevenueSource } from "@/types/revenue";
import { ExpenseCategory } from "@/types/expense";

/**
 * Helper function to suggest revenue source based on description
 */
export function suggestRevenueSource(description: string): { source: RevenueSource, confidence: number } | undefined {
  if (!description) {
    return undefined;
  }
  
  const desc = description.toLowerCase();
  
  // Simple rule-based source suggestions
  if (desc.includes('loan') || desc.includes('credit') || desc.includes('advance')) {
    return { source: 'other', confidence: 0.7 };
  } else if (desc.includes('sale') || desc.includes('payment') || desc.includes('invoice')) {
    return { source: 'sales', confidence: 0.8 };
  } else if (desc.includes('interest') || desc.includes('dividend')) {
    return { source: 'investments', confidence: 0.9 };
  } else if (desc.includes('consult') || desc.includes('service')) {
    return { source: 'consulting', confidence: 0.8 };
  } else if (desc.includes('rent') || desc.includes('lease') || desc.includes('property')) {
    return { source: 'rental', confidence: 0.9 };
  } else if (desc.includes('donation') || desc.includes('gift')) {
    return { source: 'donations', confidence: 0.9 };
  } else if (desc.includes('grant')) {
    return { source: 'grants', confidence: 0.9 };
  } else if (desc.includes('royalty') || desc.includes('license')) {
    return { source: 'royalties', confidence: 0.8 };
  }
  
  // Default suggestion with lower confidence
  return { source: 'sales', confidence: 0.6 };
}

/**
 * Helper function to suggest expense category based on description
 */
export function suggestExpenseCategory(description: string): { category: ExpenseCategory, confidence: number } | undefined {
  if (!description) {
    return undefined;
  }
  
  const desc = description.toLowerCase();
  
  // Simple rule-based category suggestions
  if (desc.includes('rent') || desc.includes('lease') || desc.includes('property')) {
    return { category: 'rent', confidence: 0.9 };
  } else if (desc.includes('meal') || desc.includes('food') || desc.includes('lunch') || desc.includes('dinner') || desc.includes('restaurant')) {
    return { category: 'meals', confidence: 0.8 };
  } else if (desc.includes('travel') || desc.includes('flight') || desc.includes('hotel') || desc.includes('taxi') || desc.includes('uber')) {
    return { category: 'travel', confidence: 0.9 };
  } else if (desc.includes('electricity') || desc.includes('water') || desc.includes('gas') || desc.includes('internet') || desc.includes('phone')) {
    return { category: 'utilities', confidence: 0.9 };
  } else if (desc.includes('software') || desc.includes('subscription') || desc.includes('saas')) {
    return { category: 'software', confidence: 0.8 };
  } else if (desc.includes('computer') || desc.includes('laptop') || desc.includes('printer') || desc.includes('server')) {
    return { category: 'hardware', confidence: 0.8 };
  } else if (desc.includes('advert') || desc.includes('marketing') || desc.includes('promotion')) {
    return { category: 'marketing', confidence: 0.8 };
  } else if (desc.includes('salary') || desc.includes('wage') || desc.includes('payroll')) {
    return { category: 'salaries', confidence: 0.9 };
  } else if (desc.includes('tax') || desc.includes('vat') || desc.includes('duty')) {
    return { category: 'taxes', confidence: 0.9 };
  } else if (desc.includes('office') || desc.includes('stationery') || desc.includes('supplies')) {
    return { category: 'office', confidence: 0.7 };
  }
  
  // Default suggestion with lower confidence
  return { category: 'other', confidence: 0.6 };
}
