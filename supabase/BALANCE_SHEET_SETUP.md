# Balance Sheet System - Database Setup Guide

This guide explains the database structure for tracking assets, liabilities, and net worth snapshots in the Money Tracker Mobile app.

---

## 📊 Overview

The balance sheet system consists of **three main tables**:

1. **`assets`** - Track user assets (cash, bank accounts, investments, property)
2. **`liabilities`** - Track user debts (credit cards, loans, mortgages)
3. **`balance_snapshots`** - Historical records of net worth over time

---

## 🗄️ Database Schema

### 1. Assets Table

Stores all user-owned assets with their current values.

```sql
Table: public.assets
Columns:
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - name (text) - Asset name (e.g., "Chase Checking", "401k")
  - type (text) - Asset type: 'cash' | 'bank' | 'investment' | 'property' | 'other'
  - current_value (numeric) - Current monetary value (must be ≥ 0)
  - currency (text, default 'USD') - ISO 4217 currency code
  - description (text, nullable) - Optional notes
  - created_at (timestamptz)
  - updated_at (timestamptz) - Auto-updated on changes
```

**Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own assets
- ✅ Automatic `updated_at` timestamp via trigger
- ✅ Check constraint: `current_value >= 0`
- ✅ Check constraint: type must be valid enum value
- ✅ Indexes on `user_id`, `(user_id, type)`, `created_at`

**Example Usage:**
```typescript
import { supabase } from '@/lib/supabase';
import { AssetInsert } from '@/types/database';

// Create a new asset
const newAsset: AssetInsert = {
  user_id: 'user-uuid',
  name: 'Chase Checking Account',
  type: 'bank',
  current_value: 5000.00,
  currency: 'USD',
  description: 'Primary checking account'
};

const { data, error } = await supabase
  .from('assets')
  .insert(newAsset)
  .select()
  .single();
```

---

### 2. Liabilities Table

Stores all user debts and obligations.

```sql
Table: public.liabilities
Columns:
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - name (text) - Liability name (e.g., "Chase Visa", "Student Loan")
  - type (text) - Type: 'credit_card' | 'loan' | 'mortgage' | 'other'
  - current_balance (numeric) - Outstanding balance (must be ≥ 0)
  - interest_rate (numeric, nullable) - Annual interest rate (0-100)
  - currency (text, default 'USD') - ISO 4217 currency code
  - description (text, nullable) - Optional notes
  - due_date (date, nullable) - Next payment due date
  - minimum_payment (numeric, nullable) - Minimum payment amount
  - created_at (timestamptz)
  - updated_at (timestamptz) - Auto-updated on changes
```

**Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own liabilities
- ✅ Automatic `updated_at` timestamp via trigger
- ✅ Check constraint: `current_balance >= 0`
- ✅ Check constraint: `interest_rate` between 0-100 or null
- ✅ Check constraint: type must be valid enum value
- ✅ Indexes on `user_id`, `(user_id, type)`, `due_date`, `created_at`

**Example Usage:**
```typescript
import { supabase } from '@/lib/supabase';
import { LiabilityInsert } from '@/types/database';

// Create a new liability
const newLiability: LiabilityInsert = {
  user_id: 'user-uuid',
  name: 'Chase Freedom Credit Card',
  type: 'credit_card',
  current_balance: 1500.00,
  interest_rate: 18.99,
  currency: 'USD',
  due_date: '2025-02-15',
  minimum_payment: 50.00,
  description: 'Travel rewards card'
};

const { data, error } = await supabase
  .from('liabilities')
  .insert(newLiability)
  .select()
  .single();
```

---

### 3. Balance Snapshots Table

Records historical snapshots of net worth for trend analysis.

```sql
Table: public.balance_snapshots
Columns:
  - id (uuid, primary key)
  - user_id (uuid, foreign key → auth.users)
  - snapshot_date (date) - Date of snapshot
  - total_assets (numeric) - Sum of all assets
  - total_liabilities (numeric) - Sum of all liabilities
  - net_worth (numeric) - Calculated: total_assets - total_liabilities
  - notes (text, nullable) - Optional snapshot notes
  - created_at (timestamptz)

Constraints:
  - UNIQUE (user_id, snapshot_date) - One snapshot per user per date
```

**Features:**
- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own snapshots
- ✅ **Automatic net worth calculation** via trigger
- ✅ **Helper function** to create snapshots from current assets/liabilities
- ✅ Unique constraint prevents duplicate snapshots
- ✅ Indexes on `user_id`, `(user_id, snapshot_date)`, `snapshot_date`

**Automatic Net Worth Calculation:**
The `net_worth` column is automatically calculated on insert/update:
```sql
net_worth = total_assets - total_liabilities
```

**Helper Function:**
```sql
-- Create a snapshot from current assets/liabilities
SELECT create_balance_snapshot(
  'user-uuid',           -- user_id
  current_date          -- snapshot_date (optional, defaults to today)
);
```

**Example Usage:**
```typescript
import { supabase } from '@/lib/supabase';

// Create snapshot using helper function (recommended)
const { data, error } = await supabase.rpc('create_balance_snapshot', {
  p_user_id: 'user-uuid',
  p_snapshot_date: '2025-01-27'
});

// Or manually create/update snapshot
const { data, error } = await supabase
  .from('balance_snapshots')
  .insert({
    user_id: 'user-uuid',
    snapshot_date: '2025-01-27',
    total_assets: 50000.00,
    total_liabilities: 15000.00,
    // net_worth will be auto-calculated as 35000.00
  })
  .select()
  .single();
```

---

## 🔐 Security (Row Level Security)

All three tables have **Row Level Security (RLS) enabled** with the following policies:

### Assets Policies
- ✅ `Users can view their own assets` (SELECT)
- ✅ `Users can insert their own assets` (INSERT)
- ✅ `Users can update their own assets` (UPDATE)
- ✅ `Users can delete their own assets` (DELETE)

### Liabilities Policies
- ✅ `Users can view their own liabilities` (SELECT)
- ✅ `Users can insert their own liabilities` (INSERT)
- ✅ `Users can update their own liabilities` (UPDATE)
- ✅ `Users can delete their own liabilities` (DELETE)

### Balance Snapshots Policies
- ✅ `Users can view their own balance snapshots` (SELECT)
- ✅ `Users can insert their own balance snapshots` (INSERT)
- ✅ `Users can update their own balance snapshots` (UPDATE)
- ✅ `Users can delete their own balance snapshots` (DELETE)

**All policies use:** `auth.uid() = user_id`

---

## 🚀 Running the Migrations

To create these tables in your Supabase project:

### Option 1: Supabase Dashboard (Recommended for First Time)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Run each migration file in order:
   - `20250127_create_assets_table.sql`
   - `20250127_create_liabilities_table.sql`
   - `20250127_create_balance_snapshots_table.sql`

### Option 2: Supabase CLI
```bash
# Link your project (first time only)
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### Option 3: Manual Migration
Copy the SQL from each migration file and run it in your Supabase SQL Editor.

---

## 📱 TypeScript Integration

All tables have full TypeScript type definitions in `types/database.ts`:

```typescript
import { Asset, AssetInsert, AssetUpdate } from '@/types/database';
import { Liability, LiabilityInsert, LiabilityUpdate } from '@/types/database';
import { BalanceSnapshot, BalanceSnapshotInsert, BalanceSnapshotUpdate } from '@/types/database';

// Fetch all assets
const { data: assets } = await supabase
  .from('assets')
  .select('*');

// Create new liability
const newLiability: LiabilityInsert = {
  user_id: userId,
  name: 'Car Loan',
  type: 'loan',
  current_balance: 15000
};

// Update asset
const update: AssetUpdate = {
  current_value: 6000
};
```

---

## 💡 Usage Patterns

### 1. Calculate Current Net Worth
```typescript
import { supabase } from '@/lib/supabase';

async function getCurrentNetWorth(userId: string) {
  // Get total assets
  const { data: assets } = await supabase
    .from('assets')
    .select('current_value')
    .eq('user_id', userId);
  
  const totalAssets = assets?.reduce((sum, a) => sum + a.current_value, 0) || 0;

  // Get total liabilities
  const { data: liabilities } = await supabase
    .from('liabilities')
    .select('current_balance')
    .eq('user_id', userId);
  
  const totalLiabilities = liabilities?.reduce((sum, l) => sum + l.current_balance, 0) || 0;

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities
  };
}
```

### 2. Create Daily Snapshot (Automated)
```typescript
async function createDailySnapshot(userId: string) {
  const { data, error } = await supabase.rpc('create_balance_snapshot', {
    p_user_id: userId,
    p_snapshot_date: new Date().toISOString().split('T')[0]
  });
  
  if (error) console.error('Snapshot error:', error);
  return data;
}

// Call this daily (e.g., via cron job or on user login)
```

### 3. Get Net Worth Trend (Last 30 Days)
```typescript
async function getNetWorthTrend(userId: string, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from('balance_snapshots')
    .select('snapshot_date, net_worth')
    .eq('user_id', userId)
    .gte('snapshot_date', startDate.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: true });

  return data;
}
```

### 4. Get Assets by Type
```typescript
async function getAssetsByType(userId: string) {
  const { data } = await supabase
    .from('assets')
    .select('type, current_value')
    .eq('user_id', userId);

  // Group by type
  const grouped = data?.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + asset.current_value;
    return acc;
  }, {} as Record<string, number>);

  return grouped;
}
```

---

## 🎯 Next Steps

1. **Create Service Layer**
   - `services/assetService.ts` for CRUD operations
   - `services/liabilityService.ts` for CRUD operations
   - `services/balanceSheetService.ts` for calculations

2. **Create Context**
   - `contexts/BalanceSheetContext.tsx` for state management

3. **Build UI Components**
   - Balance sheet view screen
   - Asset/liability forms
   - Net worth charts
   - Historical trend graphs

4. **Implement Automation**
   - Daily snapshot creation
   - Net worth notifications
   - Payment reminders (for liabilities with due dates)

---

## 📚 Additional Features (Optional)

### Asset Value History
Track asset value changes over time (e.g., investment portfolio):
```sql
CREATE TABLE asset_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id uuid REFERENCES assets(id) ON DELETE CASCADE,
  value_date date NOT NULL,
  value numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Liability Payment Tracking
Track payments made on liabilities:
```sql
CREATE TABLE liability_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  liability_id uuid REFERENCES liabilities(id) ON DELETE CASCADE,
  payment_date date NOT NULL,
  amount numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

---

## ✅ Verification Checklist

After running migrations, verify:

- [ ] All three tables created successfully
- [ ] RLS policies are active (check in Supabase Dashboard > Authentication > Policies)
- [ ] Indexes created (check in Supabase Dashboard > Database > Indexes)
- [ ] Triggers working (test `updated_at` auto-update)
- [ ] `create_balance_snapshot` function accessible
- [ ] TypeScript types match database schema
- [ ] Test CRUD operations with authenticated user
- [ ] Verify users can only access their own data

---

## 🆘 Troubleshooting

**Issue:** "permission denied for table assets"
- **Solution:** Ensure RLS policies are created and user is authenticated

**Issue:** "duplicate key value violates unique constraint"
- **Solution:** Check for existing snapshot on the same date before creating

**Issue:** "net_worth not calculated"
- **Solution:** Verify the `calculate_net_worth` trigger is active

**Issue:** "Cannot call function create_balance_snapshot"
- **Solution:** Grant execute permission (already done in migration)

---

## 📖 Related Documentation

- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Budget Service Guide](../BUDGET_SERVICE_GUIDE.md)
- [Database Types Reference](../types/database.ts)

---

**Created:** January 27, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

