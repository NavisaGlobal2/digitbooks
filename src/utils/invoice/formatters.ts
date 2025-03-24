
/**
 * Utility functions for formatting values in invoices
 */

// Function to format currency
export const formatNaira = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2
  }).format(amount);
};

// Function to format currency without the symbol
export const formatAmountWithoutSymbol = (amount: number) => {
  return new Intl.NumberFormat('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

// Export a general currency formatter that can be used throughout the app
export const formatCurrency = formatNaira;
