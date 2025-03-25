
/**
 * Utility functions for formatting values in invoices
 */

// Function to format currency
export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Function to format currency without the symbol
export const formatAmountWithoutSymbol = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format currency with consistent spacing for tables
export const formatTableCurrency = (amount: number) => {
  const formatted = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  // Ensure consistent spacing by removing any non-breaking spaces
  return formatted.replace(/\s/g, ' ');
};

// Export a general currency formatter that can be used throughout the app
export const formatCurrency = formatNaira;
