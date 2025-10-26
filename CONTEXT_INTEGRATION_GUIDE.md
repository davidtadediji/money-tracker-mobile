# Budget Context Integration Guide

Complete guide to integrating BudgetContext into your Money Tracker Mobile app.

## 🎯 Overview

The BudgetContext provides centralized state management for budgets throughout your app. It handles:

- ✅ Automatic user authentication
- ✅ Budget CRUD operations
- ✅ Loading and error states
- ✅ Optimistic updates
- ✅ Auth state synchronization

## 📋 Step-by-Step Integration

### Step 1: Wrap Your App with BudgetProvider

Open `app/_layout.tsx` and wrap your app with `BudgetProvider`:

```typescript
// Add this import
import { BudgetProvider } from '@/contexts/BudgetContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      {/* Wrap with BudgetProvider */}
      <BudgetProvider>
        <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }} initialRouteName="index">
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            {/* ... other screens ... */}
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BudgetProvider>
    </SafeAreaProvider>
  );
}
```

**See example:** `examples/budget-integration/_layout-with-provider.tsx`

### Step 2: Update Budget Index Screen

Replace the contents of `app/(tabs)/budget/index.tsx`:

**Option A: Simple replacement**
```bash
# Backup current file
cp app/(tabs)/budget/index.tsx app/(tabs)/budget/index.backup.tsx

# Copy from example
cp examples/budget-integration/budget-list-with-context.tsx app/(tabs)/budget/index.tsx
```

**Option B: Manual integration**

1. Import the hook:
```typescript
import { useBudget } from '@/contexts/BudgetContext';
```

2. Replace state management:
```typescript
// OLD: Manual state management
const [budgets, setBudgets] = useState([]);
const [loading, setLoading] = useState(true);

// NEW: Use the hook
const { budgets, loading, error, deleteBudget, refreshBudgets } = useBudget();
```

3. Remove manual fetch logic - the context handles it automatically!

**See complete example:** `examples/budget-integration/budget-list-with-context.tsx`

### Step 3: Update Create Budget Screen

Replace the contents of `app/(tabs)/budget/create.tsx`:

**Option A: Simple replacement**
```bash
# Backup current file
cp app/(tabs)/budget/create.tsx app/(tabs)/budget/create.backup.tsx

# Copy from example
cp examples/budget-integration/create-budget-with-context.tsx app/(tabs)/budget/create.tsx
```

**Option B: Manual integration**

1. Import the hook:
```typescript
import { useBudget } from '@/contexts/BudgetContext';
```

2. Use context instead of direct service calls:
```typescript
// OLD: Direct service call
import { createBudget } from '@/services/budgetService';
const { data: { user } } = await supabase.auth.getUser();
const { data, error } = await createBudget(user.id, category, amount, period, date);

// NEW: Use context
const { createBudget } = useBudget();
const { success, error } = await createBudget(category, amount, period, date);
```

**See complete example:** `examples/budget-integration/create-budget-with-context.tsx`

## 🚀 Quick Start Example

After wrapping your app with `BudgetProvider`, using budgets is simple:

```typescript
import { useBudget } from '@/contexts/BudgetContext';

function MyComponent() {
  const { budgets, loading, createBudget } = useBudget();

  if (loading) return <ActivityIndicator />;

  return (
    <View>
      <Text>You have {budgets.length} budgets</Text>
      <Button title="Create Budget" onPress={() => {
        createBudget('Groceries', 500, 'monthly', '2025-01-01');
      }} />
    </View>
  );
}
```

## 📊 Context vs Direct Service Calls

### Before (Direct Service Calls)

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getUserBudgets, createBudget, deleteBudget } from '@/services/budgetService';

function BudgetScreen() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await getUserBudgets(user.id);
    if (error) {
      setError(error.message);
    } else {
      setBudgets(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await createBudget(user.id, 'Groceries', 500, 'monthly', '2025-01-01');
    if (!error) {
      loadBudgets(); // Reload all budgets
    }
  };

  const handleDelete = async (id) => {
    await deleteBudget(id);
    loadBudgets(); // Reload all budgets
  };

  // ... render logic
}
```

### After (Using Context)

```typescript
import { useBudget } from '@/contexts/BudgetContext';

function BudgetScreen() {
  const { 
    budgets, 
    loading, 
    error, 
    createBudget, 
    deleteBudget 
  } = useBudget();

  const handleCreate = async () => {
    const { success } = await createBudget('Groceries', 500, 'monthly', '2025-01-01');
    if (success) {
      Alert.alert('Success', 'Budget created!');
      // State automatically updated!
    }
  };

  const handleDelete = async (id) => {
    const { success } = await deleteBudget(id);
    if (success) {
      Alert.alert('Success', 'Budget deleted!');
      // State automatically updated!
    }
  };

  // ... render logic
}
```

**Benefits:**
- ✅ **50% less code** - No manual state management
- ✅ **Automatic updates** - No need to reload after operations
- ✅ **Shared state** - Access budgets from any component
- ✅ **Built-in auth** - No need to get user ID manually
- ✅ **Error handling** - Consistent error handling everywhere

## 🔄 Migration Checklist

Use this checklist when migrating to BudgetContext:

### In `app/_layout.tsx`:
- [ ] Import `BudgetProvider`
- [ ] Wrap app with `<BudgetProvider>`
- [ ] Verify app still loads

### In `app/(tabs)/budget/index.tsx`:
- [ ] Import `useBudget` hook
- [ ] Replace state variables with `useBudget()`
- [ ] Remove manual fetch logic
- [ ] Remove user auth code (context handles it)
- [ ] Update delete handler to use context
- [ ] Test loading, empty state, and data display
- [ ] Test pull-to-refresh
- [ ] Test delete functionality

### In `app/(tabs)/budget/create.tsx`:
- [ ] Import `useBudget` hook
- [ ] Replace `createBudget` service call with context
- [ ] Remove user auth code (context handles it)
- [ ] Test form submission
- [ ] Test error handling
- [ ] Test navigation back to list

### General:
- [ ] Remove unused service imports
- [ ] Test with authenticated user
- [ ] Test with unauthenticated user
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Check for console errors

## 🎨 Common Patterns

### Pattern 1: Display Budget Count

```typescript
function DashboardWidget() {
  const { budgets, loading } = useBudget();

  if (loading) return <Text>Loading...</Text>;

  return <Text>You have {budgets.length} active budgets</Text>;
}
```

### Pattern 2: Filter Budgets

```typescript
function MonthlyBudgets() {
  const { budgets } = useBudget();

  const monthlyBudgets = budgets.filter(b => b.period === 'monthly');

  return <FlatList data={monthlyBudgets} />;
}
```

### Pattern 3: Budget Summary

```typescript
function BudgetSummary() {
  const { budgets } = useBudget();

  const totalLimit = budgets.reduce((sum, b) => sum + b.limit_amount, 0);

  return <Text>Total Budget Limit: ${totalLimit.toFixed(2)}</Text>;
}
```

### Pattern 4: Create Budget Form

```typescript
function QuickBudgetForm() {
  const { createBudget } = useBudget();
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async () => {
    const { success, error } = await createBudget(
      category,
      parseFloat(amount),
      'monthly',
      new Date().toISOString().split('T')[0]
    );

    if (success) {
      setCategory('');
      setAmount('');
      Alert.alert('Success!');
    } else {
      Alert.alert('Error', error);
    }
  };

  return (
    <View>
      <TextInput value={category} onChangeText={setCategory} />
      <TextInput value={amount} onChangeText={setAmount} />
      <Button title="Create" onPress={handleSubmit} />
    </View>
  );
}
```

### Pattern 5: Delete with Confirmation

```typescript
function BudgetItem({ budget }) {
  const { deleteBudget } = useBudget();

  const handleDelete = () => {
    Alert.alert(
      'Delete Budget',
      `Delete "${budget.category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { success } = await deleteBudget(budget.id);
            if (success) {
              Alert.alert('Deleted successfully');
            }
          },
        },
      ]
    );
  };

  return (
    <View>
      <Text>{budget.category}</Text>
      <Button title="Delete" onPress={handleDelete} />
    </View>
  );
}
```

## 🐛 Troubleshooting

### Error: "useBudget must be used within a BudgetProvider"

**Problem:** Component using `useBudget` is not wrapped with `BudgetProvider`.

**Solution:** 
1. Check that `BudgetProvider` is in `app/_layout.tsx`
2. Make sure it wraps all screens that use budgets
3. Restart your app

### Budgets not loading

**Problem:** User not authenticated or database not set up.

**Solution:**
1. Check that user is logged in
2. Verify `.env` file has correct Supabase credentials
3. Confirm database migration was run
4. Check Supabase dashboard for errors

### Budgets not updating after create/delete

**Problem:** Context not updating local state.

**Solution:**
1. Check console for errors
2. Verify service functions are working
3. Call `refreshBudgets()` manually if needed
4. Check that you're using the latest context code

### Multiple renders or performance issues

**Problem:** Component re-rendering too often.

**Solution:**
1. Use `useMemo` for filtered/computed budget data
2. Use `useCallback` for event handlers
3. Extract budget items into separate components

Example:
```typescript
const monthlyBudgets = useMemo(
  () => budgets.filter(b => b.period === 'monthly'),
  [budgets]
);

const handleDelete = useCallback(async (id) => {
  await deleteBudget(id);
}, [deleteBudget]);
```

## 📚 Advanced Usage

### Custom Hook for Filtered Budgets

```typescript
// hooks/useBudgetFilters.ts
import { useMemo } from 'react';
import { useBudget } from '@/contexts/BudgetContext';

export function useMonthlyBudgets() {
  const { budgets, ...rest } = useBudget();
  
  const monthlyBudgets = useMemo(
    () => budgets.filter(b => b.period === 'monthly'),
    [budgets]
  );

  return { budgets: monthlyBudgets, ...rest };
}

// Usage
function MonthlyView() {
  const { budgets, loading } = useMonthlyBudgets();
  // Only monthly budgets
}
```

### Budget Statistics Hook

```typescript
// hooks/useBudgetStats.ts
import { useMemo } from 'react';
import { useBudget } from '@/contexts/BudgetContext';

export function useBudgetStats() {
  const { budgets } = useBudget();

  return useMemo(() => {
    const total = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const byPeriod = {
      weekly: budgets.filter(b => b.period === 'weekly').length,
      monthly: budgets.filter(b => b.period === 'monthly').length,
      yearly: budgets.filter(b => b.period === 'yearly').length,
    };

    return { total, count: budgets.length, byPeriod };
  }, [budgets]);
}

// Usage
function StatsView() {
  const { total, count, byPeriod } = useBudgetStats();
  
  return (
    <View>
      <Text>Total Limit: ${total}</Text>
      <Text>Total Budgets: {count}</Text>
      <Text>Monthly: {byPeriod.monthly}</Text>
    </View>
  );
}
```

## ✅ Testing Your Integration

### Manual Testing Checklist

1. **Load budgets on app start**
   - [ ] Open app
   - [ ] Budgets load automatically
   - [ ] Loading indicator shows
   - [ ] Empty state displays if no budgets

2. **Create budget**
   - [ ] Fill in form
   - [ ] Submit
   - [ ] Success message shows
   - [ ] New budget appears in list immediately
   - [ ] No page reload needed

3. **Delete budget**
   - [ ] Click delete button
   - [ ] Confirmation alert appears
   - [ ] Confirm deletion
   - [ ] Budget removed from list immediately

4. **Pull to refresh**
   - [ ] Pull down on budget list
   - [ ] Loading indicator shows
   - [ ] Budgets reload

5. **Error handling**
   - [ ] Turn off internet
   - [ ] Try to create budget
   - [ ] Error message displays
   - [ ] Turn internet back on
   - [ ] Retry works

6. **Authentication**
   - [ ] Log out
   - [ ] Budgets clear from state
   - [ ] Log back in
   - [ ] Budgets load again

### Test with Console Logs

Add to `BudgetContext.tsx` temporarily:

```typescript
useEffect(() => {
  console.log('Budgets updated:', budgets.length);
}, [budgets]);
```

You should see logs when:
- App loads
- Budget created
- Budget deleted
- User logs in/out

## 🎉 Summary

The BudgetContext provides:

- ✅ **Centralized state** - One source of truth for budgets
- ✅ **Automatic auth** - Handles user authentication automatically
- ✅ **Optimistic updates** - Instant UI updates
- ✅ **Simple API** - Just use `useBudget()` hook
- ✅ **Error handling** - Consistent error patterns
- ✅ **Loading states** - Built-in loading indicators
- ✅ **Auth sync** - Automatically syncs with auth state

**Next Steps:**
1. Integrate `BudgetProvider` into your app layout
2. Update budget screens to use `useBudget` hook
3. Test thoroughly
4. Remove old service call code
5. Enjoy cleaner, simpler code! 🚀

---

For more details, see:
- [Context Documentation](./contexts/README.md)
- [Service Documentation](./services/README.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)

