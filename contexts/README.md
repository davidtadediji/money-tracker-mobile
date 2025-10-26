# Budget Context

React Context for managing budget state across the Money Tracker Mobile app.

## Setup

### 1. Wrap Your App with BudgetProvider

In your root layout file (`app/_layout.tsx`):

```typescript
import { BudgetProvider } from '@/contexts/BudgetContext';

export default function RootLayout() {
  return (
    <BudgetProvider>
      {/* Your app content */}
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </BudgetProvider>
  );
}
```

### 2. Use the useBudget Hook in Components

```typescript
import { useBudget } from '@/contexts/BudgetContext';

function BudgetList() {
  const { budgets, loading, error, refreshBudgets } = useBudget();

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>Error: {error}</Text>;

  return (
    <FlatList
      data={budgets}
      onRefresh={refreshBudgets}
      refreshing={loading}
      // ...
    />
  );
}
```

## API Reference

### State

#### `budgets: Budget[]`
Array of all user budgets, sorted by creation date (newest first).

#### `loading: boolean`
Loading state for async operations.

#### `error: string | null`
Error message if any operation fails, null otherwise.

### Functions

#### `createBudget(category, limitAmount, period, startDate)`

Creates a new budget.

**Parameters:**
- `category` (string) - Budget category name
- `limitAmount` (number) - Budget limit amount
- `period` ('weekly' | 'monthly' | 'yearly') - Budget period
- `startDate` (string) - Start date in YYYY-MM-DD format

**Returns:** `Promise<{ success: boolean; budget?: Budget; error?: string }>`

**Example:**
```typescript
const { createBudget } = useBudget();

const handleCreate = async () => {
  const { success, budget, error } = await createBudget(
    'Groceries',
    500,
    'monthly',
    '2025-01-01'
  );

  if (success) {
    Alert.alert('Success', 'Budget created!');
  } else {
    Alert.alert('Error', error || 'Failed to create budget');
  }
};
```

#### `updateBudget(budgetId, updates)`

Updates an existing budget.

**Parameters:**
- `budgetId` (string) - Budget ID to update
- `updates` (object) - Fields to update:
  - `category?` (string)
  - `limit_amount?` (number)
  - `period?` ('weekly' | 'monthly' | 'yearly')

**Returns:** `Promise<{ success: boolean; budget?: Budget; error?: string }>`

**Example:**
```typescript
const { updateBudget } = useBudget();

const handleUpdate = async (id: string) => {
  const { success, budget, error } = await updateBudget(id, {
    limit_amount: 600,
  });

  if (success) {
    Alert.alert('Success', 'Budget updated!');
  } else {
    Alert.alert('Error', error || 'Failed to update budget');
  }
};
```

#### `deleteBudget(budgetId)`

Deletes a budget.

**Parameters:**
- `budgetId` (string) - Budget ID to delete

**Returns:** `Promise<{ success: boolean; error?: string }>`

**Example:**
```typescript
const { deleteBudget } = useBudget();

const handleDelete = async (id: string) => {
  Alert.alert(
    'Delete Budget',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { success, error } = await deleteBudget(id);
          
          if (success) {
            Alert.alert('Success', 'Budget deleted!');
          } else {
            Alert.alert('Error', error || 'Failed to delete budget');
          }
        },
      },
    ]
  );
};
```

#### `refreshBudgets()`

Manually refresh budgets from the server.

**Returns:** `Promise<void>`

**Example:**
```typescript
const { refreshBudgets, loading } = useBudget();

return (
  <FlatList
    data={budgets}
    refreshing={loading}
    onRefresh={refreshBudgets}
    // ...
  />
);
```

## Features

### ✅ Automatic User Authentication
- Automatically fetches user ID from Supabase auth
- Handles auth state changes (sign in/out)
- Clears budgets on sign out

### ✅ Optimistic Updates
- Local state updates immediately
- No need to refresh after create/update/delete
- Better UX with instant feedback

### ✅ Error Handling
- Catches and exposes errors via `error` state
- Returns error messages from all operations
- Logs errors to console for debugging

### ✅ Loading States
- Tracks loading state for all operations
- Use with pull-to-refresh
- Show loading indicators

### ✅ Real-time Sync
- Listens to auth state changes
- Automatically fetches budgets on sign in
- Clears state on sign out

## Usage Examples

### Budget List Screen

```typescript
import React from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

export default function BudgetListScreen() {
  const { budgets, loading, error, refreshBudgets } = useBudget();

  if (loading && budgets.length === 0) {
    return <ActivityIndicator size="large" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <FlatList
      data={budgets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View>
          <Text>{item.category}</Text>
          <Text>${item.limit_amount}</Text>
        </View>
      )}
      refreshing={loading}
      onRefresh={refreshBudgets}
      ListEmptyComponent={<Text>No budgets yet</Text>}
    />
  );
}
```

### Create Budget Form

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

export default function CreateBudgetScreen() {
  const { createBudget } = useBudget();
  const [category, setCategory] = useState('');
  const [limit, setLimit] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    const { success, error } = await createBudget(
      category,
      parseFloat(limit),
      'monthly',
      new Date().toISOString().split('T')[0]
    );

    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Budget created!');
      setCategory('');
      setLimit('');
    } else {
      Alert.alert('Error', error || 'Failed to create budget');
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <TextInput
        placeholder="Limit"
        value={limit}
        onChangeText={setLimit}
        keyboardType="numeric"
      />
      <Button
        title={loading ? 'Creating...' : 'Create Budget'}
        onPress={handleSubmit}
        disabled={loading}
      />
    </View>
  );
}
```

### Update Budget

```typescript
import React, { useState } from 'react';
import { Button, Alert } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

function UpdateButton({ budgetId }: { budgetId: string }) {
  const { updateBudget } = useBudget();
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);

    const { success, error } = await updateBudget(budgetId, {
      limit_amount: 600,
    });

    setLoading(false);

    if (success) {
      Alert.alert('Success', 'Budget updated!');
    } else {
      Alert.alert('Error', error || 'Failed to update budget');
    }
  };

  return (
    <Button
      title={loading ? 'Updating...' : 'Increase Limit'}
      onPress={handleUpdate}
      disabled={loading}
    />
  );
}
```

### Delete Budget

```typescript
import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

function DeleteButton({ budgetId, category }: { budgetId: string; category: string }) {
  const { deleteBudget } = useBudget();

  const handleDelete = () => {
    Alert.alert(
      'Delete Budget',
      `Delete "${category}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deleteBudget(budgetId);
            
            if (success) {
              Alert.alert('Success', 'Budget deleted!');
            } else {
              Alert.alert('Error', error || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity onPress={handleDelete}>
      <Text style={{ color: 'red' }}>Delete</Text>
    </TouchableOpacity>
  );
}
```

### Display Budget Count

```typescript
import React from 'react';
import { Text } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

function BudgetCount() {
  const { budgets, loading } = useBudget();

  if (loading) return <Text>Loading...</Text>;

  return <Text>You have {budgets.length} budgets</Text>;
}
```

### Filter Budgets by Period

```typescript
import React, { useMemo } from 'react';
import { FlatList } from 'react-native';
import { useBudget } from '@/contexts/BudgetContext';

function MonthlyBudgets() {
  const { budgets } = useBudget();

  const monthlyBudgets = useMemo(
    () => budgets.filter(b => b.period === 'monthly'),
    [budgets]
  );

  return (
    <FlatList
      data={monthlyBudgets}
      // ...
    />
  );
}
```

## Best Practices

### 1. Use Context for Global State
Use the context for operations that affect the global budget list.

### 2. Local State for UI
Use local state for form inputs and UI-specific state.

### 3. Error Handling
Always check the `success` flag and handle errors:

```typescript
const { success, error } = await createBudget(...);
if (!success) {
  Alert.alert('Error', error || 'Something went wrong');
}
```

### 4. Loading States
Show loading indicators during operations:

```typescript
const [submitting, setSubmitting] = useState(false);

const handleSubmit = async () => {
  setSubmitting(true);
  await createBudget(...);
  setSubmitting(false);
};
```

### 5. Pull to Refresh
Use `refreshBudgets` for pull-to-refresh:

```typescript
<FlatList
  refreshing={loading}
  onRefresh={refreshBudgets}
/>
```

### 6. Memoize Filtered Data
Use `useMemo` for expensive filtering operations:

```typescript
const filteredBudgets = useMemo(
  () => budgets.filter(predicate),
  [budgets]
);
```

## Troubleshooting

### "useBudget must be used within a BudgetProvider"

**Problem:** Trying to use `useBudget` outside of `BudgetProvider`.

**Solution:** Wrap your app with `BudgetProvider` in the root layout.

### Budgets not loading

**Problem:** User not authenticated.

**Solution:** Ensure user is signed in before accessing budgets. The context handles this automatically.

### Stale data after operations

**Problem:** UI not updating after create/update/delete.

**Solution:** The context updates local state automatically. If you see stale data, try calling `refreshBudgets()`.

### Memory leaks

**Problem:** Context subscriptions not cleaned up.

**Solution:** The context handles cleanup automatically. If you create custom subscriptions, clean them up in `useEffect` return.

## Migration from Direct Service Calls

**Before (using service directly):**
```typescript
import { getUserBudgets, createBudget } from '@/services/budgetService';

const [budgets, setBudgets] = useState([]);

useEffect(() => {
  const load = async () => {
    const { data } = await getUserBudgets(userId);
    setBudgets(data);
  };
  load();
}, [userId]);
```

**After (using context):**
```typescript
import { useBudget } from '@/contexts/BudgetContext';

const { budgets, loading, error } = useBudget();
// That's it! No need to manage state or fetch data.
```

## Advanced Usage

### Custom Hook for Filtered Budgets

```typescript
import { useMemo } from 'react';
import { useBudget } from '@/contexts/BudgetContext';

export function useMonthlyBudgets() {
  const { budgets, loading, error } = useBudget();
  
  const monthlyBudgets = useMemo(
    () => budgets.filter(b => b.period === 'monthly'),
    [budgets]
  );

  return { budgets: monthlyBudgets, loading, error };
}
```

### Budget Statistics

```typescript
import { useMemo } from 'react';
import { useBudget } from '@/contexts/BudgetContext';

export function useBudgetStats() {
  const { budgets } = useBudget();

  const stats = useMemo(() => {
    const total = budgets.reduce((sum, b) => sum + b.limit_amount, 0);
    const count = budgets.length;
    const avg = count > 0 ? total / count : 0;

    return { total, count, avg };
  }, [budgets]);

  return stats;
}
```

---

For more information, see [Budget Service Documentation](../services/README.md).

