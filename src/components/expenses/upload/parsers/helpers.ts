
// This file is kept for backward compatibility, but we're no longer using mock data
// All transaction parsing now uses real data from the uploaded files

// Any helper functions for parsing can be defined here
export const formatCurrency = (amount: number, currency: string = '₦') => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Parse amount from various formats
export const parseAmount = (value: any): number => {
  if (typeof value === 'number') return value;
  
  if (typeof value === 'string') {
    // Remove currency symbols and commas, including Naira symbol (₦)
    const cleaned = value.replace(/[,$€£₦\s]/g, '');
    
    // Support formats with parentheses indicating negative numbers: (100.00)
    if (cleaned.startsWith('(') && cleaned.endsWith(')')) {
      return -parseFloat(cleaned.slice(1, -1));
    }
    
    return parseFloat(cleaned) || 0;
  }
  
  return 0;
};

// Format date to a standard format
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};
