
// Transaction types
export type TransactionType = 'debit' | 'credit' | 'unknown'

// Transaction interface
export interface Transaction {
  date: string
  description: string
  amount: number
  type: TransactionType
}
