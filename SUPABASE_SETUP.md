# Supabase Setup Guide for Money Tracker Mobile

This guide will help you set up Supabase for your Money Tracker Mobile app.

## 📋 What's Been Created

### 1. **Database Migration** (`supabase/migrations/20250126_create_budgets_table.sql`)
   - Creates the `budgets` table with all required columns
   - Sets up Row Level Security (RLS) policies
   - Creates performance indexes
   - Adds automatic timestamp updates

### 2. **TypeScript Types** (`types/database.ts`)
   - Database type definitions for TypeScript
   - Helper types: `Budget`, `BudgetInsert`, `BudgetUpdate`

### 3. **Supabase Client** (`lib/supabase.ts`)
   - Pre-configured Supabase client
   - Auth session management
   - Auto token refresh

### 4. **Budget Service** (`lib/budgets.ts`)
   - Ready-to-use functions for budget operations:
     - `getAllBudgets()` - Get all user budgets
     - `getBudgetsByPeriod()` - Filter by week/month/year
     - `getBudgetById()` - Get specific budget
     - `getBudgetByCategory()` - Get budget for a category
     - `createBudget()` - Create new budget
     - `updateBudget()` - Update existing budget
     - `deleteBudget()` - Delete budget
     - `budgetExists()` - Check if budget exists
     - `getActiveBudgets()` - Get currently active budgets

## 🚀 Setup Steps

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details:
   - **Name**: money-tracker-mobile
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Wait for project to be created (1-2 minutes)

### Step 2: Configure Environment Variables

1. Create a `.env` file in the project root:
   ```bash
   touch .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. Get your credentials:
   - Go to your Supabase dashboard
   - Navigate to **Settings** → **API**
   - Copy **Project URL** → paste as `EXPO_PUBLIC_SUPABASE_URL`
   - Copy **anon public** key → paste as `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 3: Run the Database Migration

#### Option A: Using Supabase Dashboard (Easiest)

1. Open your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **+ New Query**
4. Copy the entire contents of `supabase/migrations/20250126_create_budgets_table.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. You should see "Success. No rows returned"

#### Option B: Using Supabase CLI

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Login to Supabase:
   ```bash
   supabase login
   ```

3. Link your project (get project ref from dashboard URL):
   ```bash
   supabase link --project-ref your-project-ref
   ```

4. Push migrations:
   ```bash
   supabase db push
   ```

### Step 4: Verify Setup

1. In Supabase Dashboard, go to **Database** → **Tables**
2. You should see the `budgets` table with these columns:
   - id (uuid)
   - user_id (uuid)
   - category (text)
   - limit_amount (numeric)
   - period (text)
   - start_date (date)
   - created_at (timestamp with time zone)
   - updated_at (timestamp with time zone)

3. Check RLS is enabled:
   - Go to **Authentication** → **Policies**
   - You should see 4 policies for the budgets table

### Step 5: Restart Your App

```bash
# Stop your current Expo server (Ctrl + C)
# Then restart it
npm start
```

## 📖 Usage Examples

### Import the Budget Service

```typescript
import { 
  createBudget, 
  getAllBudgets, 
  updateBudget, 
  deleteBudget 
} from '@/lib/budgets';
```

### Create a Budget

```typescript
const handleCreateBudget = async () => {
  const { data, error } = await createBudget({
    category: 'Groceries',
    limit_amount: 500,
    period: 'monthly',
    start_date: '2025-01-01'
  });

  if (error) {
    console.error('Failed to create budget:', error);
    return;
  }

  console.log('Budget created:', data);
};
```

### Get All Budgets

```typescript
const fetchBudgets = async () => {
  const { data, error } = await getAllBudgets();
  
  if (error) {
    console.error('Failed to fetch budgets:', error);
    return;
  }

  console.log('User budgets:', data);
};
```

### Update a Budget

```typescript
const handleUpdateBudget = async (budgetId: string) => {
  const { data, error } = await updateBudget(budgetId, {
    limit_amount: 600,
    category: 'Food & Dining'
  });

  if (error) {
    console.error('Failed to update budget:', error);
    return;
  }

  console.log('Budget updated:', data);
};
```

### Delete a Budget

```typescript
const handleDeleteBudget = async (budgetId: string) => {
  const { success, error } = await deleteBudget(budgetId);

  if (!success) {
    console.error('Failed to delete budget:', error);
    return;
  }

  console.log('Budget deleted successfully');
};
```

### Get Active Budgets

```typescript
const fetchActiveBudgets = async () => {
  const { data, error } = await getActiveBudgets();
  
  if (error) {
    console.error('Failed to fetch active budgets:', error);
    return;
  }

  console.log('Active budgets:', data);
};
```

## 🔐 Security Features

### Row Level Security (RLS)

The budgets table has RLS enabled with these policies:

1. **SELECT Policy**: Users can only view their own budgets
2. **INSERT Policy**: Users can only create budgets with their own user_id
3. **UPDATE Policy**: Users can only update their own budgets
4. **DELETE Policy**: Users can only delete their own budgets

This means:
- ✅ Users automatically see only their data
- ✅ Users can't access other users' budgets
- ✅ No additional filtering needed in your app code
- ✅ Database-level security (can't be bypassed)

## ⚡ Performance

The following indexes have been created for optimal query performance:

- `idx_budgets_user_id` - Fast user budget lookups
- `idx_budgets_period` - Quick filtering by period
- `idx_budgets_user_period` - Combined user + period queries
- `idx_budgets_start_date` - Date-based filtering

## 🐛 Troubleshooting

### "Supabase URL or Anon Key is missing"

**Problem**: Environment variables not found

**Solution**:
1. Make sure `.env` file exists in project root
2. Variables must start with `EXPO_PUBLIC_`
3. Restart your Expo development server

### "relation 'public.budgets' does not exist"

**Problem**: Migration not run

**Solution**:
1. Go to Supabase Dashboard → SQL Editor
2. Run the migration SQL file
3. Verify table exists in Database → Tables

### "permission denied for table budgets"

**Problem**: RLS policies not set up correctly

**Solution**:
1. Check that RLS is enabled on budgets table
2. Verify all 4 policies exist
3. Make sure user is authenticated before querying

### "row-level security policy for table 'budgets' prevents this"

**Problem**: Trying to insert with wrong user_id

**Solution**:
- The `createBudget()` function automatically uses the current user's ID
- Don't manually specify `user_id` when using the service functions

## 📝 Next Steps

1. **Test the Setup**:
   - Try creating a budget from your app
   - Check if it appears in Supabase Dashboard → Table Editor

2. **Implement in Your App**:
   - Update `app/(tabs)/budget/create.tsx` to use `createBudget()`
   - Update `app/(tabs)/budget/index.tsx` to use `getAllBudgets()`

3. **Add Authentication**:
   - Make sure users are logged in before accessing budgets
   - Use Supabase Auth for user management

4. **Future Enhancements**:
   - Create a `transactions` table
   - Add budget vs. actual spending calculations
   - Set up real-time subscriptions for live updates

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)

## 💡 Tips

1. **Always use the service functions** in `lib/budgets.ts` instead of writing raw queries
2. **Don't commit `.env`** to version control (it's in `.gitignore`)
3. **Use TypeScript types** for better autocomplete and error checking
4. **Check Supabase logs** in the dashboard for debugging database issues
5. **Test with real users** to ensure RLS policies work correctly

---

Need help? Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions).

