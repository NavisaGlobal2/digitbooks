
import { toast } from "sonner";

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

// Generate more realistic mock data with appropriate transaction descriptions
export const generateMockTransactions = (count: number, currencySymbol = '₦'): ParsedTransaction[] => {
  const now = new Date();
  const transactions: ParsedTransaction[] = [];
  
  // Common transaction names
  const creditDescriptions = [
    'SALARY PAYMENT', 
    'ACCOUNT TRANSFER CREDIT', 
    'INTEREST PAYMENT',
    'CUSTOMER DEPOSIT',
    'REFUND'
  ];
  
  const debitDescriptions = [
    'ATM WITHDRAWAL', 
    'DEBIT CARD PURCHASE', 
    'UTILITY PAYMENT',
    'SUBSCRIPTION PAYMENT',
    'INTERNET BANKING TRANSFER',
    'MOBILE BANKING TRANSFER',
    'SUPERMARKET PURCHASE',
    'RESTAURANT PAYMENT',
    'FUEL STATION PURCHASE',
    'ONLINE SHOPPING PAYMENT'
  ];
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i - Math.floor(Math.random() * 5));
    
    // More realistic amount values
    const baseAmount = Math.floor(Math.random() * 20) * 100 + Math.floor(Math.random() * 100);
    const amount = baseAmount + (Math.random() < 0.3 ? Math.floor(Math.random() * 10000) : 0);
    
    // Type is mostly debit with some credits
    const type = i % 5 === 0 ? 'credit' : 'debit';
    
    // Select appropriate description based on type
    let description;
    if (type === 'credit') {
      description = creditDescriptions[Math.floor(Math.random() * creditDescriptions.length)];
    } else {
      description = debitDescriptions[Math.floor(Math.random() * debitDescriptions.length)];
    }
    
    // Add some detail to the description occasionally
    if (Math.random() > 0.5) {
      if (type === 'debit' && description.includes('PURCHASE')) {
        const vendors = ['SHOPRITE', 'SPAR', 'H&M', 'JUMIA', 'MARKETPLACE', 'AMAZON'];
        description += ' - ' + vendors[Math.floor(Math.random() * vendors.length)];
      } else if (type === 'debit' && description.includes('TRANSFER')) {
        description += ' - REF' + Math.floor(Math.random() * 1000000);
      }
    }
    
    transactions.push({
      id: `trans-${i}`,
      date,
      description,
      amount: amount / 100, // Convert to decimal for realistic values
      type,
      selected: type === 'debit',
    });
  }
  
  console.log(`Generated ${count} mock transactions with ${currencySymbol} currency symbol`);
  return transactions;
};

import { ParsedTransaction } from "./types";
