# 🚨 QUICK FIX: Apply Database Migrations

## Problem
Your app is showing: **"Could not find the table 'public.user_profiles'"**

This means the database tables haven't been created yet.

---

## ⚡ FASTEST FIX (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to: **https://app.supabase.com**
2. Sign in
3. Click on your project

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar (looks like `</>`)
2. Click **"+ New query"** button at the top

### Step 3: Apply Migrations ONE BY ONE

Copy and paste each SQL file content into the editor, then click **"Run"**.

**IMPORTANT: Do them in this exact order!**

#### Migration 1: User Profiles (MOST IMPORTANT - FIX YOUR ERROR)
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250131_create_user_profiles_table.sql
```
Click **"Run"** ✓

#### Migration 2: Budgets
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250125_create_budgets_table.sql
```
Click **"Run"** ✓

#### Migration 3: Transactions
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250126_create_transactions_table.sql
```
Click **"Run"** ✓

#### Migration 4: Assets
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250127_create_assets_table.sql
```
Click **"Run"** ✓

#### Migration 5: Liabilities
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250127_create_liabilities_table.sql
```
Click **"Run"** ✓

#### Migration 6: Balance Snapshots
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250127_create_balance_snapshots_table.sql
```
Click **"Run"** ✓

#### Migration 7: Reports
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250127_create_reports_table.sql
```
Click **"Run"** ✓

#### Migration 8: Smart Entries
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250128_create_smart_entries_table.sql
```
Click **"Run"** ✓

#### Migration 9: Recurring Transactions
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250129_create_recurring_transactions_table.sql
```
Click **"Run"** ✓

#### Migration 10: User Settings
```sql
-- Copy ENTIRE content from:
supabase/migrations/20250130_create_user_settings_table.sql
```
Click **"Run"** ✓

---

### Step 4: Verify Tables Created

1. Click **"Table Editor"** in left sidebar
2. You should now see 10 tables:
   - ✅ `user_profiles`
   - ✅ `budgets`
   - ✅ `transactions`
   - ✅ `assets`
   - ✅ `liabilities`
   - ✅ `balance_snapshots`
   - ✅ `reports`
   - ✅ `smart_entries`
   - ✅ `recurring_transactions`
   - ✅ `user_settings`

---

### Step 5: Restart Your App

1. Stop the expo server (Ctrl+C in terminal)
2. Clear cache: `npx expo start -c`
3. Try signing up again!

---

## 🎯 Alternative: Use CLI (If you have it installed)

If you have Supabase CLI installed, this is even faster:

```bash
cd /Users/ephraimnakireru/Documents/money-tracker-mobile
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## ✅ After Migrations Are Applied

Your app will work! The error will be gone because:
- ✅ `user_profiles` table will exist
- ✅ User profile will auto-create on signup
- ✅ All features will work properly

---

## 🆘 Still Having Issues?

### Check Environment Variables

Make sure your `.env` file has the correct credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Get these from:
Supabase Dashboard → Settings → API

---

## 📞 Need Help?

If migrations fail, check:
1. You're logged into the correct Supabase project
2. Your database password is correct
3. No tables already exist (drop them if they do)

---

**Priority:** Apply migration #1 (`20250131_create_user_profiles_table.sql`) first to fix your immediate error!

