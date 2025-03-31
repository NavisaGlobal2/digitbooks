
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      invoice_payments: {
        Row: {
          id: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference: string | null
          receipt_url: string | null
          user_id: string
          created_at: string | null
        }
        Insert: {
          id?: string
          invoice_id: string
          amount: number
          payment_date: string
          payment_method: string
          reference?: string | null
          receipt_url?: string | null
          user_id: string
          created_at?: string | null
        }
        Update: {
          id?: string
          invoice_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          reference?: string | null
          receipt_url?: string | null
          user_id?: string
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          }
        ]
      }
      // We don't need to define all other tables here,
      // just the one we're adding to avoid conflicts
    }
  }
}
