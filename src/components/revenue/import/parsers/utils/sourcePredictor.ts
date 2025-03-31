
import { RevenueSource } from "@/types/revenue";

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
