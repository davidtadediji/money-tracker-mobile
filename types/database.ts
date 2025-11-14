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
      budgets: {
        Row: {
          id: string
          user_id: string
          category: string
          limit_amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          limit_amount: number
          period: 'weekly' | 'monthly' | 'yearly'
          start_date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          limit_amount?: number
          period?: 'weekly' | 'monthly' | 'yearly'
          start_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category: string
          amount: number
          date: string
          description: string | null
          type: 'expense' | 'income'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          amount: number
          date: string
          description?: string | null
          type: 'expense' | 'income'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          amount?: number
          date?: string
          description?: string | null
          type?: 'expense' | 'income'
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      assets: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'investment' | 'property' | 'other'
          current_value: number
          currency: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'cash' | 'bank' | 'investment' | 'property' | 'other'
          current_value: number
          currency?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'cash' | 'bank' | 'investment' | 'property' | 'other'
          current_value?: number
          currency?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      liabilities: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'credit_card' | 'loan' | 'mortgage' | 'other'
          current_balance: number
          interest_rate: number | null
          currency: string
          description: string | null
          due_date: string | null
          minimum_payment: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: 'credit_card' | 'loan' | 'mortgage' | 'other'
          current_balance: number
          interest_rate?: number | null
          currency?: string
          description?: string | null
          due_date?: string | null
          minimum_payment?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'credit_card' | 'loan' | 'mortgage' | 'other'
          current_balance?: number
          interest_rate?: number | null
          currency?: string
          description?: string | null
          due_date?: string | null
          minimum_payment?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "liabilities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      balance_snapshots: {
        Row: {
          id: string
          user_id: string
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          net_worth: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          snapshot_date: string
          total_assets: number
          total_liabilities: number
          net_worth?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          snapshot_date?: string
          total_assets?: number
          total_liabilities?: number
          net_worth?: number
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "balance_snapshots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      reports: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          report_type: 'income_expense' | 'category' | 'trend' | 'budget' | 'custom'
          date_range: {
            start: string
            end: string
          }
          filters: {
            categories?: string[]
            types?: ('income' | 'expense')[]
            minAmount?: number
            maxAmount?: number
          } | null
          grouping: 'day' | 'week' | 'month' | 'year' | 'category' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          report_type: 'income_expense' | 'category' | 'trend' | 'budget' | 'custom'
          date_range: {
            start: string
            end: string
          }
          filters?: {
            categories?: string[]
            types?: ('income' | 'expense')[]
            minAmount?: number
            maxAmount?: number
          } | null
          grouping?: 'day' | 'week' | 'month' | 'year' | 'category' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          report_type?: 'income_expense' | 'category' | 'trend' | 'budget' | 'custom'
          date_range?: {
            start: string
            end: string
          }
          filters?: {
            categories?: string[]
            types?: ('income' | 'expense')[]
            minAmount?: number
            maxAmount?: number
          } | null
          grouping?: 'day' | 'week' | 'month' | 'year' | 'category' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      smart_entries: {
        Row: {
          id: string
          user_id: string
          entry_type: 'receipt_scan' | 'voice_entry' | 'bulk_import' | 'screenshot'
          status: 'processing' | 'completed' | 'failed' | 'pending_review'
          original_data: any | null
          processed_data: any | null
          extracted_transactions: any | null
          error_message: string | null
          confidence_score: number | null
          processing_time_ms: number | null
          created_at: string
          updated_at: string
          processed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          entry_type: 'receipt_scan' | 'voice_entry' | 'bulk_import' | 'screenshot'
          status?: 'processing' | 'completed' | 'failed' | 'pending_review'
          original_data?: any | null
          processed_data?: any | null
          extracted_transactions?: any | null
          error_message?: string | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          entry_type?: 'receipt_scan' | 'voice_entry' | 'bulk_import' | 'screenshot'
          status?: 'processing' | 'completed' | 'failed' | 'pending_review'
          original_data?: any | null
          processed_data?: any | null
          extracted_transactions?: any | null
          error_message?: string | null
          confidence_score?: number | null
          processing_time_ms?: number | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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

// Helper types for easier usage
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export type Asset = Database['public']['Tables']['assets']['Row']
export type AssetInsert = Database['public']['Tables']['assets']['Insert']
export type AssetUpdate = Database['public']['Tables']['assets']['Update']

export type Liability = Database['public']['Tables']['liabilities']['Row']
export type LiabilityInsert = Database['public']['Tables']['liabilities']['Insert']
export type LiabilityUpdate = Database['public']['Tables']['liabilities']['Update']

export type BalanceSnapshot = Database['public']['Tables']['balance_snapshots']['Row']
export type BalanceSnapshotInsert = Database['public']['Tables']['balance_snapshots']['Insert']
export type BalanceSnapshotUpdate = Database['public']['Tables']['balance_snapshots']['Update']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type SmartEntry = Database['public']['Tables']['smart_entries']['Row']
export type SmartEntryInsert = Database['public']['Tables']['smart_entries']['Insert']
export type SmartEntryUpdate = Database['public']['Tables']['smart_entries']['Update']

