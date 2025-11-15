# Supabase Database Setup Guide

This guide will help you apply all database migrations to your Supabase project.

## 📋 Overview

Your app has **10 migration files** that need to be applied to create the complete database schema:

1. `20250125_create_budgets_table.sql` - Budget management
2. `20250126_create_transactions_table.sql` - Transaction tracking
3. `20250127_create_assets_table.sql` - Asset management
4. `20250127_create_balance_snapshots_table.sql` - Balance history
5. `20250127_create_liabilities_table.sql` - Liability tracking
6. `20250127_create_reports_table.sql` - Custom reports
7. `20250128_create_smart_entries_table.sql` - Smart data entry
8. `20250129_create_recurring_transactions_table.sql` - Recurring items
9. `20250130_create_user_settings_table.sql` - User preferences
10. `20250131_create_user_profiles_table.sql` - User profiles

---

## 🚀 Method 1: Supabase Dashboard (RECOMMENDED)

This is the easiest method for first-time setup.

### Steps:

1. **Open Supabase Dashboard**
   - Go to [https://app.supabase.com](https://app.supabase.com)
   - Sign in to your account
   - Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"+ New query"** button

3. **Apply Each Migration**
   
   For each migration file (in order):
   
   a. Open the migration file in your code editor
   b. Copy the entire SQL content
   c. Paste it into the Supabase SQL Editor
   d. Click **"Run"** (or press Ctrl/Cmd + Enter)
   e. Wait for success confirmation
   f. Repeat for the next file

4. **Verify Tables Created**
   - Click **"Table Editor"** in left sidebar
   - You should see all 10 tables:
     - `budgets`
     - `transactions`
     - `assets`
     - `liabilities`
     - `balance_snapshots`
     - `reports`
     - `smart_entries`
     - `recurring_transactions`
     - `user_settings`
     - `user_profiles`

---

## ⚡ Method 2: Supabase CLI

For more advanced users who have the Supabase CLI set up.

### Prerequisites:

Install Supabase CLI if you haven't:

```bash
# macOS
brew install supabase/tap/supabase

# Other platforms
npm install -g supabase
```

### Steps:

1. **Login to Supabase**
   ```bash
   supabase login
   ```

2. **Link Your Project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   
   > Find your project ref in Supabase Dashboard → Settings → General → Reference ID

3. **Apply Migrations**
   ```bash
   cd /Users/ephraimnakireru/Documents/money-tracker-mobile
   supabase db push
   ```
   
   This will automatically apply all migrations in the `supabase/migrations/` folder in order.

4. **Verify**
   ```bash
   supabase db remote --project-ref YOUR_PROJECT_REF
   ```

---

## 🔍 Method 3: Manual SQL Execution

If you prefer running SQL manually:

### Using psql:

```bash
# Connect to your database
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# Run each migration
\i supabase/migrations/20250125_create_budgets_table.sql
\i supabase/migrations/20250126_create_transactions_table.sql
\i supabase/migrations/20250127_create_assets_table.sql
\i supabase/migrations/20250127_create_balance_snapshots_table.sql
\i supabase/migrations/20250127_create_liabilities_table.sql
\i supabase/migrations/20250127_create_reports_table.sql
\i supabase/migrations/20250128_create_smart_entries_table.sql
\i supabase/migrations/20250129_create_recurring_transactions_table.sql
\i supabase/migrations/20250130_create_user_settings_table.sql
\i supabase/migrations/20250131_create_user_profiles_table.sql
```

---

## ✅ Verification Checklist

After applying migrations, verify everything is set up correctly:

### 1. Check Tables Exist
In Supabase Dashboard → Table Editor, you should see:
- [ ] budgets
- [ ] transactions
- [ ] assets
- [ ] liabilities
- [ ] balance_snapshots
- [ ] reports
- [ ] smart_entries
- [ ] recurring_transactions
- [ ] user_settings
- [ ] user_profiles

### 2. Check RLS Policies
In Supabase Dashboard → Authentication → Policies:
- [ ] Each table should have 4 policies (SELECT, INSERT, UPDATE, DELETE)
- [ ] All policies should be enabled
- [ ] Policies should reference `auth.uid()`

### 3. Check Indexes
In SQL Editor, run:
```sql
SELECT tablename, indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
ORDER BY tablename, indexname;
```
You should see multiple indexes for user_id columns.

### 4. Check Triggers
In SQL Editor, run:
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_schema = 'public';
```
You should see update triggers for each table.

---

## 🎯 After Migration

Once all migrations are applied:

1. **Test the Connection**
   - Run your app: `npm start` or `npx expo start`
   - Try signing up a new user
   - Check if user_profiles is auto-created

2. **Enable Real-time (Optional)**
   - Go to Database → Replication
   - Enable real-time for tables that need it

3. **Set up Storage (Optional)**
   - If using avatars or receipts
   - Go to Storage → Create bucket
   - Set up policies

---

## 🐛 Troubleshooting

### Error: "relation already exists"
**Solution:** The table was already created. Either:
- Skip this migration, or
- Drop the table first: `DROP TABLE table_name CASCADE;`

### Error: "permission denied"
**Solution:** Make sure you're using the database password, not the API key.

### Error: "function does not exist"
**Solution:** Make sure uuid extension is enabled:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### RLS Policies Not Working
**Solution:** 
1. Check if RLS is enabled: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
2. Verify user is authenticated
3. Check policy conditions match your use case

---

## 📞 Support

If you encounter issues:

1. **Check Supabase Logs**
   - Dashboard → Logs → Database

2. **Test Connection**
   ```typescript
   import { supabase } from '@/lib/supabase';
   
   const { data, error } = await supabase.from('budgets').select('*');
   console.log(data, error);
   ```

3. **Verify Environment Variables**
   - Check `.env` file has correct:
     - `EXPO_PUBLIC_SUPABASE_URL`
     - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 🎉 Success!

Once all migrations are applied, your database is fully set up and ready to use!

Your app will automatically:
- Create user profiles on signup
- Apply Row Level Security
- Track all financial data
- Sync across devices

Next steps:
- Start the app and test authentication
- Create a transaction
- Set up a budget
- Explore all features!

---

**Last Updated:** January 2025  
**Migration Files:** 10 total  
**Total Tables:** 10 tables + auth.users (built-in)

