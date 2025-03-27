
// Define column name patterns for more readable code
export function getColumnPatterns() {
  return {
    DATE_COLUMN_PATTERNS: [
      'date', 'transaction date', 'txn date', 'value date', 'posting date', 
      'trans date', 'entry date', 'transaction date', 'post date', 'effective date',
      'date posted', 'booking date', 'trade date', 'settlement date', 'date of transaction',
      'transaction time', 'datetime', 'val date', 'val. date', 'value. date', 'date value'
    ],
    
    DESCRIPTION_COLUMN_PATTERNS: [
      'description', 'desc', 'narrative', 'details', 'transaction description', 
      'particulars', 'narration', 'transaction narration', 'remarks', 'trans desc',
      'note', 'notes', 'memo', 'reference', 'payee', 'transaction details',
      'transaction information', 'payment details', 'transaction note', 'merchant',
      'merchant name', 'beneficiary', 'sender', 'payment reference', 'remarks', 'trans. details'
    ],
    
    AMOUNT_COLUMN_PATTERNS: [
      'amount', 'transaction amount', 'sum', 'value', 'debit/credit', 'naira value', 
      'ngn', 'ngn amount', 'debit', 'credit', 'deposit', 'withdrawal', 'payment amount',
      'transaction value', 'money', 'cash', 'total', 'net amount', 'gross amount',
      'transaction sum', 'payment', 'fee', 'charge', 'balance', 'amount (ngn)', 'amt',
      'amount in naira', 'local amount', 'transaction fee', 'amount paid', 'price',
      'inflow', 'outflow', 'deposit', 'withdrawal'
    ],
    
    CREDIT_COLUMN_PATTERNS: [
      'credit', 'deposit', 'cr', 'credit amount', 'inflow', 'money in', 'income',
      'incoming', 'received', 'money received', 'payment received', 'deposits', 
      'credits', 'cr amount', 'amount received', '+', 'plus', 'addition'
    ],
    
    DEBIT_COLUMN_PATTERNS: [
      'debit', 'withdrawal', 'dr', 'debit amount', 'outflow', 'money out', 'expense',
      'outgoing', 'sent', 'money sent', 'payment sent', 'withdrawals', 'debits',
      'dr amount', 'amount sent', '-', 'minus', 'subtraction'
    ]
  };
}
