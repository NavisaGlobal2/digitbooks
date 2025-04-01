export type RevenueSource = 
  | 'sales' 
  | 'services' 
  | 'investments' 
  | 'grants' 
  | 'donations' 
  | 'royalties' 
  | 'rental' 
  | 'consulting' 
  | 'affiliate' 
  | 'other';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'bank transfer' | 'crypto' | 'other';

export interface Revenue {
  id: string;
  user_id?: string;
  revenue_number?: string;
  description: string;
  amount: number;
  date: Date;
  source: RevenueSource;
  notes?: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  client_name?: string;
  created_at?: Date;
  // Add status as an alias for payment_status for database compatibility
  status?: PaymentStatus;
}

// Define a type for the database schema version of Revenue
export interface RevenueDB {
  id: string;
  user_id?: string;
  revenue_number?: string;
  description: string;
  amount: number;
  date: string; // ISO string format in database
  source: string;
  notes?: string;
  status: string;
  reference?: string;
  created_at?: string;
  // These fields might not exist in the DB schema yet
  payment_method?: string;
  payment_status?: string;
  client_name?: string;
}

// Helper function to convert RevenueDB to Revenue
export function mapDbToRevenue(dbRevenue: RevenueDB): Revenue {
  return {
    id: dbRevenue.id,
    description: dbRevenue.description,
    amount: dbRevenue.amount,
    date: new Date(dbRevenue.date),
    source: dbRevenue.source as RevenueSource,
    notes: dbRevenue.notes,
    revenue_number: dbRevenue.revenue_number,
    user_id: dbRevenue.user_id,
    created_at: dbRevenue.created_at ? new Date(dbRevenue.created_at) : undefined,
    // Map the fields correctly based on DB structure
    payment_method: (dbRevenue.payment_method || 'bank transfer') as PaymentMethod,
    payment_status: (dbRevenue.payment_status || dbRevenue.status) as PaymentStatus,
    client_name: dbRevenue.client_name,
    status: (dbRevenue.payment_status || dbRevenue.status) as PaymentStatus
  };
}

// Helper function to convert Revenue to DB format
export function mapRevenueToDb(revenue: Omit<Revenue, "id">): any {
  return {
    description: revenue.description,
    amount: revenue.amount,
    date: revenue.date.toISOString(),
    source: revenue.source,
    notes: revenue.notes,
    revenue_number: revenue.revenue_number,
    created_at: new Date().toISOString(),
    // Map payment_status to status for database compatibility
    status: revenue.payment_status,
    // Include payment_method but omit client_name which doesn't exist in the schema
    payment_method: revenue.payment_method,
    payment_status: revenue.payment_status,
  };
}
