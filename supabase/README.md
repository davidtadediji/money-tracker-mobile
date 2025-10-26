# Supabase Database Setup

This directory contains the database migrations for the Money Tracker Mobile app.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env` in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   - Go to your Supabase project settings: https://app.supabase.com/project/_/settings/api
   - Copy the **Project URL** and **anon/public key**
   - Paste them into your `.env` file

### 3. Run the Migration

You have two options to run the migration:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `migrations/20250126_create_budgets_table.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute the migration

#### Option B: Using Supabase CLI

1. Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. Push the migration:
   ```bash
   supabase db push
   ```

### 4. Verify the Setup

After running the migration, verify that:

1. The `budgets` table exists in your database
2. RLS (Row Level Security) is enabled
3. The policies are in place
4. The indexes have been created

You can check this in the Supabase Dashboard under:
- **Database** → **Tables** (to see the budgets table)
- **Authentication** → **Policies** (to see RLS policies)

## Database Schema

### Budgets Table

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, auto-generated |
| `user_id` | UUID | Foreign key to auth.users |
| `category` | TEXT | Expense category name |
| `limit_amount` | DECIMAL(12,2) | Budget limit amount |
| `period` | TEXT | 'weekly', 'monthly', or 'yearly' |
| `start_date` | DATE | Start date of the budget period |
| `created_at` | TIMESTAMPTZ | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | Last update timestamp (auto-updated) |

### Indexes

- `idx_budgets_user_id` on `user_id`
- `idx_budgets_period` on `period`
- `idx_budgets_user_period` on `user_id, period` (composite)
- `idx_budgets_start_date` on `start_date`

### Row Level Security (RLS) Policies

- Users can only view their own budgets
- Users can only insert budgets with their own user_id
- Users can only update their own budgets
- Users can only delete their own budgets

## Usage Example

```typescript
import { supabase } from '@/lib/supabase';
import { BudgetInsert } from '@/types/database';

// Create a new budget
const newBudget: BudgetInsert = {
  user_id: 'user-uuid',
  category: 'Groceries',
  limit_amount: 500,
  period: 'monthly',
  start_date: '2025-01-01'
};

const { data, error } = await supabase
  .from('budgets')
  .insert(newBudget)
  .select()
  .single();

// Get all budgets for current user
const { data: budgets, error: fetchError } = await supabase
  .from('budgets')
  .select('*')
  .order('created_at', { ascending: false });

// Update a budget
const { data: updated, error: updateError } = await supabase
  .from('budgets')
  .update({ limit_amount: 600 })
  .eq('id', 'budget-uuid')
  .select()
  .single();

// Delete a budget
const { error: deleteError } = await supabase
  .from('budgets')
  .delete()
  .eq('id', 'budget-uuid');
```

## Troubleshooting

### Error: "relation 'public.budgets' does not exist"
- Make sure you've run the migration in your Supabase project

### Error: "permission denied for table budgets"
- Check that RLS policies are properly set up
- Make sure the user is authenticated when making queries

### Error: "duplicate key value violates unique constraint"
- This usually means you're trying to insert a record with an ID that already exists
- Let the database auto-generate IDs by not providing the `id` field

## Next Steps

After setting up the budgets table, you might want to:

1. Create a transactions table to track actual expenses
2. Add a view to calculate budget vs. actual spending
3. Set up real-time subscriptions for budget updates
4. Create database functions for complex calculations

