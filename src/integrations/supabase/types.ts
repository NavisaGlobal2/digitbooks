export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      budgets: {
        Row: {
          created_at: string
          end_date: string
          id: string
          items: Json
          name: string
          start_date: string
          status: string
          total_budget: number
          total_spent: number
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          items: Json
          name: string
          start_date: string
          status: string
          total_budget: number
          total_spent?: number
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          items?: Json
          name?: string
          start_date?: string
          status?: string
          total_budget?: number
          total_spent?: number
          user_id?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          invoice_count: number | null
          name: string
          phone: string | null
          status: string
          total_amount: number | null
          user_id: string
        }
        Insert: {
          address?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          invoice_count?: number | null
          name: string
          phone?: string | null
          status: string
          total_amount?: number | null
          user_id: string
        }
        Update: {
          address?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          invoice_count?: number | null
          name?: string
          phone?: string | null
          status?: string
          total_amount?: number | null
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          from_statement: boolean | null
          id: string
          notes: string | null
          payment_method: string
          receipt_url: string | null
          status: string
          user_id: string
          vendor: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          from_statement?: boolean | null
          id?: string
          notes?: string | null
          payment_method: string
          receipt_url?: string | null
          status: string
          user_id: string
          vendor: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          from_statement?: boolean | null
          id?: string
          notes?: string | null
          payment_method?: string
          receipt_url?: string | null
          status?: string
          user_id?: string
          vendor?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          additional_info: string | null
          amount: number
          bank_details: Json
          client_name: string
          created_at: string
          due_date: string
          id: string
          invoice_number: string
          issued_date: string
          items: Json
          logo_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          additional_info?: string | null
          amount: number
          bank_details: Json
          client_name: string
          created_at?: string
          due_date: string
          id?: string
          invoice_number: string
          issued_date: string
          items: Json
          logo_url?: string | null
          status: string
          user_id: string
        }
        Update: {
          additional_info?: string | null
          amount?: number
          bank_details?: Json
          client_name?: string
          created_at?: string
          due_date?: string
          id?: string
          invoice_number?: string
          issued_date?: string
          items?: Json
          logo_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          availability: string
          cover_letter: string | null
          created_at: string
          email: string
          experience: string
          full_name: string
          id: string
          job_department: string
          job_title: string
          phone: string
          portfolio_link: string | null
          resume_url: string | null
          status: string
        }
        Insert: {
          availability: string
          cover_letter?: string | null
          created_at?: string
          email: string
          experience: string
          full_name: string
          id?: string
          job_department: string
          job_title: string
          phone: string
          portfolio_link?: string | null
          resume_url?: string | null
          status?: string
        }
        Update: {
          availability?: string
          cover_letter?: string | null
          created_at?: string
          email?: string
          experience?: string
          full_name?: string
          id?: string
          job_department?: string
          job_title?: string
          phone?: string
          portfolio_link?: string | null
          resume_url?: string | null
          status?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          business_name: string | null
          business_type: string | null
          created_at: string
          id: string
          industry: string | null
          phone: string | null
          rc_number: string | null
          registration_date: string | null
          tax_number: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id: string
          industry?: string | null
          phone?: string | null
          rc_number?: string | null
          registration_date?: string | null
          tax_number?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          business_type?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          phone?: string | null
          rc_number?: string | null
          registration_date?: string | null
          tax_number?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      revenues: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          reference: string | null
          revenue_number: string
          source: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          notes?: string | null
          reference?: string | null
          revenue_number: string
          source: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          reference?: string | null
          revenue_number?: string
          source?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          reference: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description: string
          id?: string
          notes?: string | null
          reference?: string | null
          status: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          reference?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
