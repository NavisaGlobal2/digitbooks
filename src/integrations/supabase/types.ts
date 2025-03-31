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
      ai_settings: {
        Row: {
          auto_open: boolean
          auto_respond: boolean
          avatar_type: string
          bot_name: string
          bot_prompt: string
          created_at: string | null
          custom_url: string | null
          id: string
          message_style: string
          model: string
          theme: string
          updated_at: string | null
          uploaded_url: string | null
          user_id: string | null
        }
        Insert: {
          auto_open?: boolean
          auto_respond?: boolean
          avatar_type?: string
          bot_name?: string
          bot_prompt?: string
          created_at?: string | null
          custom_url?: string | null
          id?: string
          message_style?: string
          model?: string
          theme?: string
          updated_at?: string | null
          uploaded_url?: string | null
          user_id?: string | null
        }
        Update: {
          auto_open?: boolean
          auto_respond?: boolean
          avatar_type?: string
          bot_name?: string
          bot_prompt?: string
          created_at?: string | null
          custom_url?: string | null
          id?: string
          message_style?: string
          model?: string
          theme?: string
          updated_at?: string | null
          uploaded_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          account_type: string | null
          balance: number | null
          bank_name: string | null
          created_at: string
          currency: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          type?: string
          updated_at?: string
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
          batch_id: string | null
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
          batch_id?: string | null
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
          batch_id?: string | null
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
      ocr_results: {
        Row: {
          created_at: string
          extracted_text: string
          file_name: string
          file_type: string
          id: string
          metadata: Json | null
          service_used: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          extracted_text: string
          file_name: string
          file_type: string
          id?: string
          metadata?: Json | null
          service_used: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          extracted_text?: string
          file_name?: string
          file_type?: string
          id?: string
          metadata?: Json | null
          service_used?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
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
          logo_url: string | null
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
          logo_url?: string | null
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
          logo_url?: string | null
          phone?: string | null
          rc_number?: string | null
          registration_date?: string | null
          tax_number?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category_id: string | null
          created_at: string
          description: string
          end_date: string | null
          frequency: string
          id: string
          next_due_date: string | null
          start_date: string
          status: string | null
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category_id?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          frequency: string
          id?: string
          next_due_date?: string | null
          start_date: string
          status?: string | null
          transaction_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category_id?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          next_due_date?: string | null
          start_date?: string
          status?: string | null
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
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
      tax_rates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          rate: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      team_invitations: {
        Row: {
          business_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          inviter_id: string
          name: string
          role: string
          status: Database["public"]["Enums"]["invitation_status"]
          team_id: string
          token: string
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          inviter_id: string
          name: string
          role: string
          status?: Database["public"]["Enums"]["invitation_status"]
          team_id: string
          token: string
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          inviter_id?: string
          name?: string
          role?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          team_id?: string
          token?: string
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          avatar: string | null
          business_id: string | null
          created_at: string
          email: string
          id: string
          name: string
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar?: string | null
          business_id?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          role: string
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar?: string | null
          business_id?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          role?: string
          status?: string
          updated_at?: string
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
      uploaded_bank_lines: {
        Row: {
          amount: number | null
          business_id: string | null
          category: string | null
          created_at: string | null
          date: string | null
          description: string | null
          id: string
          status: string | null
          type: string | null
          upload_batch_id: string
          user_id: string
        }
        Insert: {
          amount?: number | null
          business_id?: string | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string | null
          upload_batch_id: string
          user_id: string
        }
        Update: {
          amount?: number | null
          business_id?: string | null
          category?: string | null
          created_at?: string | null
          date?: string | null
          description?: string | null
          id?: string
          status?: string | null
          type?: string | null
          upload_batch_id?: string
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
      accept_team_invitation: {
        Args: {
          p_token: string
        }
        Returns: undefined
      }
      create_team_invite: {
        Args: {
          p_name: string
          p_email: string
          p_role: string
        }
        Returns: Json
      }
      get_team_member_access: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
      insert_team_member: {
        Args: {
          p_name: string
          p_email: string
          p_role: string
          p_status: string
          p_user_id: string
        }
        Returns: Json
      }
      process_team_invitation: {
        Args: {
          p_token: string
          p_user_id: string
        }
        Returns: Json
      }
      save_tagged_expenses: {
        Args: {
          p_batch_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "revoked"
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
