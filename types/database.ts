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
      recurring_transactions: {
        Row: {
          id: string
          user_id: string
          type: 'income' | 'expense'
          category: string
          amount: number
          description: string | null
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date: string
          end_date: string | null
          next_occurrence_date: string
          is_active: boolean
          last_processed_date: string | null
          notification_enabled: boolean
          notification_days_before: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'income' | 'expense'
          category: string
          amount: number
          description?: string | null
          frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string | null
          next_occurrence_date: string
          is_active?: boolean
          last_processed_date?: string | null
          notification_enabled?: boolean
          notification_days_before?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'income' | 'expense'
          category?: string
          amount?: number
          description?: string | null
          frequency?: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly'
          start_date?: string
          end_date?: string | null
          next_occurrence_date?: string
          is_active?: boolean
          last_processed_date?: string | null
          notification_enabled?: boolean
          notification_days_before?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          phone_number: string | null
          onboarding_completed: boolean
          profile_setup_completed: boolean
          is_active: boolean
          email_verified: boolean
          preferred_language: string
          timezone: string
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          onboarding_completed?: boolean
          profile_setup_completed?: boolean
          is_active?: boolean
          email_verified?: boolean
          preferred_language?: string
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          full_name?: string | null
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          phone_number?: string | null
          onboarding_completed?: boolean
          profile_setup_completed?: boolean
          is_active?: boolean
          email_verified?: boolean
          preferred_language?: string
          timezone?: string
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          display_name: string | null
          email_notifications: boolean
          push_notifications: boolean
          transaction_reminders: boolean
          budget_alerts: boolean
          recurring_reminders: boolean
          reminder_time: string
          currency_code: string
          currency_symbol: string
          decimal_places: number
          theme: 'light' | 'dark' | 'auto'
          accent_color: string
          auto_backup: boolean
          backup_frequency: 'daily' | 'weekly' | 'monthly'
          last_backup_date: string | null
          default_view: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings'
          default_transaction_type: 'income' | 'expense'
          biometric_enabled: boolean
          passcode_enabled: boolean
          show_balance: boolean
          compact_view: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          transaction_reminders?: boolean
          budget_alerts?: boolean
          recurring_reminders?: boolean
          reminder_time?: string
          currency_code?: string
          currency_symbol?: string
          decimal_places?: number
          theme?: 'light' | 'dark' | 'auto'
          accent_color?: string
          auto_backup?: boolean
          backup_frequency?: 'daily' | 'weekly' | 'monthly'
          last_backup_date?: string | null
          default_view?: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings'
          default_transaction_type?: 'income' | 'expense'
          biometric_enabled?: boolean
          passcode_enabled?: boolean
          show_balance?: boolean
          compact_view?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string | null
          email_notifications?: boolean
          push_notifications?: boolean
          transaction_reminders?: boolean
          budget_alerts?: boolean
          recurring_reminders?: boolean
          reminder_time?: string
          currency_code?: string
          currency_symbol?: string
          decimal_places?: number
          theme?: 'light' | 'dark' | 'auto'
          accent_color?: string
          auto_backup?: boolean
          backup_frequency?: 'daily' | 'weekly' | 'monthly'
          last_backup_date?: string | null
          default_view?: 'dashboard' | 'transactions' | 'budget' | 'analytics' | 'balance' | 'settings'
          default_transaction_type?: 'income' | 'expense'
          biometric_enabled?: boolean
          passcode_enabled?: boolean
          show_balance?: boolean
          compact_view?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      faqs: {
        Row: {
          id: string
          question: string
          answer: string
          category: string
          display_order: number
          is_featured: boolean
          view_count: number
          helpful_count: number
          not_helpful_count: number
          keywords: string[]
          tags: string[]
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          question: string
          answer: string
          category: string
          display_order?: number
          is_featured?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          keywords?: string[]
          tags?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          question?: string
          answer?: string
          category?: string
          display_order?: number
          is_featured?: boolean
          view_count?: number
          helpful_count?: number
          not_helpful_count?: number
          keywords?: string[]
          tags?: string[]
          is_published?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: string
          user_id: string
          subject: string
          description: string
          category: string
          priority: string
          status: string
          contact_email: string | null
          contact_phone: string | null
          preferred_contact_method: string
          app_version: string | null
          device_info: any | null
          screenshot_urls: string[] | null
          admin_response: string | null
          resolved_at: string | null
          resolution_notes: string | null
          satisfaction_rating: number | null
          feedback: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject: string
          description: string
          category: string
          priority?: string
          status?: string
          contact_email?: string | null
          contact_phone?: string | null
          preferred_contact_method?: string
          app_version?: string | null
          device_info?: any | null
          screenshot_urls?: string[] | null
          admin_response?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          satisfaction_rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject?: string
          description?: string
          category?: string
          priority?: string
          status?: string
          contact_email?: string | null
          contact_phone?: string | null
          preferred_contact_method?: string
          app_version?: string | null
          device_info?: any | null
          screenshot_urls?: string[] | null
          admin_response?: string | null
          resolved_at?: string | null
          resolution_notes?: string | null
          satisfaction_rating?: number | null
          feedback?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      onboarding_steps: {
        Row: {
          id: string
          step_number: number
          title: string
          description: string
          icon_name: string | null
          image_url: string | null
          video_url: string | null
          action_button_text: string | null
          action_button_route: string | null
          content_type: string
          is_required: boolean
          can_skip: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          step_number: number
          title: string
          description: string
          icon_name?: string | null
          image_url?: string | null
          video_url?: string | null
          action_button_text?: string | null
          action_button_route?: string | null
          content_type?: string
          is_required?: boolean
          can_skip?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          step_number?: number
          title?: string
          description?: string
          icon_name?: string | null
          image_url?: string | null
          video_url?: string | null
          action_button_text?: string | null
          action_button_route?: string | null
          content_type?: string
          is_required?: boolean
          can_skip?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_onboarding_progress: {
        Row: {
          id: string
          user_id: string
          current_step: number
          completed_steps: number[]
          skipped_steps: number[]
          is_completed: boolean
          completed_at: string | null
          show_tips: boolean
          show_tutorials: boolean
          started_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          current_step?: number
          completed_steps?: number[]
          skipped_steps?: number[]
          is_completed?: boolean
          completed_at?: string | null
          show_tips?: boolean
          show_tutorials?: boolean
          started_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          current_step?: number
          completed_steps?: number[]
          skipped_steps?: number[]
          is_completed?: boolean
          completed_at?: string | null
          show_tips?: boolean
          show_tutorials?: boolean
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_onboarding_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      app_info: {
        Row: {
          id: string
          app_version: string
          build_number: string | null
          release_date: string | null
          whats_new: string[]
          bug_fixes: string[]
          improvements: string[]
          terms_of_service_url: string | null
          privacy_policy_url: string | null
          licenses_text: string | null
          support_email: string | null
          support_phone: string | null
          website_url: string | null
          social_links: any | null
          developer_name: string | null
          developer_website: string | null
          copyright_text: string | null
          is_current_version: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          app_version: string
          build_number?: string | null
          release_date?: string | null
          whats_new?: string[]
          bug_fixes?: string[]
          improvements?: string[]
          terms_of_service_url?: string | null
          privacy_policy_url?: string | null
          licenses_text?: string | null
          support_email?: string | null
          support_phone?: string | null
          website_url?: string | null
          social_links?: any | null
          developer_name?: string | null
          developer_website?: string | null
          copyright_text?: string | null
          is_current_version?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          app_version?: string
          build_number?: string | null
          release_date?: string | null
          whats_new?: string[]
          bug_fixes?: string[]
          improvements?: string[]
          terms_of_service_url?: string | null
          privacy_policy_url?: string | null
          licenses_text?: string | null
          support_email?: string | null
          support_phone?: string | null
          website_url?: string | null
          social_links?: any | null
          developer_name?: string | null
          developer_website?: string | null
          copyright_text?: string | null
          is_current_version?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      financial_goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          emoji: string | null
          color: string
          target_amount: number
          current_amount: number
          currency: string
          start_date: string
          target_date: string | null
          goal_type: string
          category: string | null
          priority: string
          status: string
          progress_percentage: number
          auto_contribute: boolean
          contribution_amount: number | null
          contribution_frequency: string | null
          next_contribution_date: string | null
          milestones: any | null
          linked_account_id: string | null
          linked_budget_id: string | null
          motivation: string | null
          notes: string | null
          completed_at: string | null
          completion_notes: string | null
          is_archived: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          emoji?: string | null
          color?: string
          target_amount: number
          current_amount?: number
          currency?: string
          start_date?: string
          target_date?: string | null
          goal_type?: string
          category?: string | null
          priority?: string
          status?: string
          auto_contribute?: boolean
          contribution_amount?: number | null
          contribution_frequency?: string | null
          next_contribution_date?: string | null
          milestones?: any | null
          linked_account_id?: string | null
          linked_budget_id?: string | null
          motivation?: string | null
          notes?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          emoji?: string | null
          color?: string
          target_amount?: number
          current_amount?: number
          currency?: string
          start_date?: string
          target_date?: string | null
          goal_type?: string
          category?: string | null
          priority?: string
          status?: string
          auto_contribute?: boolean
          contribution_amount?: number | null
          contribution_frequency?: string | null
          next_contribution_date?: string | null
          milestones?: any | null
          linked_account_id?: string | null
          linked_budget_id?: string | null
          motivation?: string | null
          notes?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          is_archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goal_contributions: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          amount: number
          contribution_type: string
          description: string | null
          notes: string | null
          linked_transaction_id: string | null
          contribution_date: string
          created_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          amount: number
          contribution_type?: string
          description?: string | null
          notes?: string | null
          linked_transaction_id?: string | null
          contribution_date?: string
          created_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          amount?: number
          contribution_type?: string
          description?: string | null
          notes?: string | null
          linked_transaction_id?: string | null
          contribution_date?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "goal_contributions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "financial_goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goal_contributions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      goal_templates: {
        Row: {
          id: string
          name: string
          description: string | null
          emoji: string | null
          color: string
          suggested_target_amount: number | null
          suggested_timeframe_months: number | null
          goal_type: string | null
          category: string | null
          motivation_template: string | null
          tips: string[] | null
          is_popular: boolean
          display_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          emoji?: string | null
          color?: string
          suggested_target_amount?: number | null
          suggested_timeframe_months?: number | null
          goal_type?: string | null
          category?: string | null
          motivation_template?: string | null
          tips?: string[] | null
          is_popular?: boolean
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          emoji?: string | null
          color?: string
          suggested_target_amount?: number | null
          suggested_timeframe_months?: number | null
          goal_type?: string | null
          category?: string | null
          motivation_template?: string | null
          tips?: string[] | null
          is_popular?: boolean
          display_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
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

export type RecurringTransaction = Database['public']['Tables']['recurring_transactions']['Row']
export type RecurringTransactionInsert = Database['public']['Tables']['recurring_transactions']['Insert']
export type RecurringTransactionUpdate = Database['public']['Tables']['recurring_transactions']['Update']

export type UserSettings = Database['public']['Tables']['user_settings']['Row']
export type UserSettingsInsert = Database['public']['Tables']['user_settings']['Insert']
export type UserSettingsUpdate = Database['public']['Tables']['user_settings']['Update']

export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
export type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update']

export type FAQ = Database['public']['Tables']['faqs']['Row']
export type FAQInsert = Database['public']['Tables']['faqs']['Insert']
export type FAQUpdate = Database['public']['Tables']['faqs']['Update']

export type SupportTicket = Database['public']['Tables']['support_tickets']['Row']
export type SupportTicketInsert = Database['public']['Tables']['support_tickets']['Insert']
export type SupportTicketUpdate = Database['public']['Tables']['support_tickets']['Update']

export type OnboardingStep = Database['public']['Tables']['onboarding_steps']['Row']
export type OnboardingStepInsert = Database['public']['Tables']['onboarding_steps']['Insert']
export type OnboardingStepUpdate = Database['public']['Tables']['onboarding_steps']['Update']

export type UserOnboardingProgress = Database['public']['Tables']['user_onboarding_progress']['Row']
export type UserOnboardingProgressInsert = Database['public']['Tables']['user_onboarding_progress']['Insert']
export type UserOnboardingProgressUpdate = Database['public']['Tables']['user_onboarding_progress']['Update']

export type AppInfo = Database['public']['Tables']['app_info']['Row']
export type AppInfoInsert = Database['public']['Tables']['app_info']['Insert']
export type AppInfoUpdate = Database['public']['Tables']['app_info']['Update']

export type FinancialGoal = Database['public']['Tables']['financial_goals']['Row']
export type FinancialGoalInsert = Database['public']['Tables']['financial_goals']['Insert']
export type FinancialGoalUpdate = Database['public']['Tables']['financial_goals']['Update']

export type GoalContribution = Database['public']['Tables']['goal_contributions']['Row']
export type GoalContributionInsert = Database['public']['Tables']['goal_contributions']['Insert']
export type GoalContributionUpdate = Database['public']['Tables']['goal_contributions']['Update']

export type GoalTemplate = Database['public']['Tables']['goal_templates']['Row']
export type GoalTemplateInsert = Database['public']['Tables']['goal_templates']['Insert']
export type GoalTemplateUpdate = Database['public']['Tables']['goal_templates']['Update']

