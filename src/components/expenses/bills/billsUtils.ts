
import { CreditCard, Zap, Building, ShoppingBag } from "lucide-react";
import { LucideIcon } from "lucide-react";

// Map category to icon
export const getCategoryIcon = (category: string): LucideIcon => {
  switch (category.toLowerCase()) {
    case 'utilities': return Zap;
    case 'rent': return Building;
    case 'software': return CreditCard;
    case 'office': return ShoppingBag;
    default: return CreditCard;
  }
};

// Get category name from category ID
export const getCategoryName = (categoryId: string | null | undefined): string => {
  // We'd ideally fetch this from a categories table
  // For now, let's use a simple mapping
  if (!categoryId) return 'Other';
  
  // Map common category IDs to names
  // This could be expanded with real category data later
  const categoryMap: Record<string, string> = {
    'utilities': 'Utilities',
    'rent': 'Rent',
    'software': 'Software',
    'office': 'Office',
    // Add more mappings as needed
  };
  
  return categoryMap[categoryId.toLowerCase()] || 'Other';
};

// Calculate days left until due date
export const calculateDaysLeft = (dueDate: string): number => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};
