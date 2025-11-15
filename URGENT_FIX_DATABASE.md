# 🚨 URGENT: Create Database Tables NOW

## The Problem

Error: **"Could not find table public.user_profiles"**

This means your database is **EMPTY** - no tables exist yet!

---

## ✅ SOLUTION: Apply Migrations in Supabase Dashboard

Follow these steps **RIGHT NOW** in your browser:

---

## 📍 STEP 1: Open Supabase SQL Editor

1. Go to: **https://app.supabase.com**
2. Sign in and select your project
3. Click **"SQL Editor"** in the left sidebar (looks like `</>`)
4. Click **"+ New query"** button

---

## 📍 STEP 2: Apply User Profiles Migration (PRIORITY #1)

This is THE MOST IMPORTANT migration - it fixes your error!

### Copy this file content:

1. Open this file in VS Code:
   ```
   supabase/migrations/20250131_create_user_profiles_table.sql
   ```

2. **SELECT ALL** (Cmd+A or Ctrl+A)

3. **COPY** (Cmd+C or Ctrl+C)

4. **PASTE** into Supabase SQL Editor

5. Click **"Run"** button (bottom right)

6. Wait for **"Success"** message ✅

---

## 📍 STEP 3: Verify Table Created

1. Click **"Table Editor"** in left sidebar
2. You should see **"user_profiles"** table
3. ✅ Success!

---

## 📍 STEP 4: Apply Remaining 9 Migrations (Optional but Recommended)

Repeat Step 2 for each file **in this order**:

1. ✅ `20250131_create_user_profiles_table.sql` (DONE!)
2. `20250125_create_budgets_table.sql`
3. `20250126_create_transactions_table.sql`
4. `20250127_create_assets_table.sql`
5. `20250127_create_liabilities_table.sql`
6. `20250127_create_balance_snapshots_table.sql`
7. `20250127_create_reports_table.sql`
8. `20250128_create_smart_entries_table.sql`
9. `20250129_create_recurring_transactions_table.sql`
10. `20250130_create_user_settings_table.sql`

---

## 🎯 Quick Visual Guide

```
Supabase Dashboard
├─ SQL Editor (click here)
│  └─ + New query
│     └─ Paste migration SQL
│     └─ Click "Run"
│     └─ Wait for "Success" ✅
│
└─ Table Editor (verify here)
   └─ Should see "user_profiles" table
```

---

## ⚡ FASTEST METHOD: Copy/Paste All At Once

If you want to be really fast, you can run multiple migrations:

1. Open SQL Editor
2. Create a new query
3. Copy ALL content from migration file
4. Paste
5. Run
6. Repeat for next file

Each migration takes ~5 seconds to run.

---

## 🆘 Need Help Finding the Files?

The migration files are located at:
```
/Users/ephraimnakireru/Documents/money-tracker-mobile/supabase/migrations/
```

In VS Code:
1. Look at the file explorer (left side)
2. Expand `supabase` folder
3. Expand `migrations` folder
4. You'll see all 10 `.sql` files

---

## ✅ After Migration #1 (user_profiles)

Your error will be FIXED! You can:
- ✅ Sign up users
- ✅ Create profiles
- ✅ Use the app

The other 9 migrations add additional features:
- Budgets
- Transactions
- Balance tracking
- Analytics
- etc.

---

## 🎉 Test After Migration

1. **Restart your app:**
   ```bash
   # Stop the server (Ctrl+C)
   npx expo start -c
   ```

2. **Try signing up:**
   - Email: test@example.com
   - Password: password123
   - Name: Test User

3. **Should work!** No more table error! ✨

---

## 📞 Priority Tasks (In Order)

1. ✅ Apply `20250131_create_user_profiles_table.sql` NOW
2. ✅ Verify table exists in Table Editor
3. ✅ Restart your app
4. ✅ Test signup
5. Then apply other 9 migrations
6. Then disable email confirmation (if needed)

---

**DO THIS FIRST before anything else!** 🚀

Without this migration, NOTHING will work in your app!

