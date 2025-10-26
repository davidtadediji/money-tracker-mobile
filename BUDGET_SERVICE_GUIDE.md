# Budget Service Implementation Guide

This guide shows you how to integrate the budget service layer into your app.

## 📁 What's Been Created

### 1. Service Layer (`services/budgetService.ts`)
Complete budget service with 5 core functions plus 2 helper functions:

**Core Functions:**
- ✅ `createBudget(userId, category, limitAmount, period, startDate)`
- ✅ `getUserBudgets(userId)`
- ✅ `updateBudget(budgetId, updates)`
- ✅ `deleteBudget(budgetId)`
- ✅ `getBudgetById(budgetId)`

**Helper Functions:**
- ✅ `getBudgetsByPeriod(userId, period)`
- ✅ `budgetExistsForCategory(userId, category, period)`

**Features:**
- Full TypeScript type safety
- Custom error handling with error codes
- Input validation
- Consistent response format: `{ data, error }`
- Graceful error messages

### 2. Example Implementations
- `app/(tabs)/budget/index.example.tsx` - Budget list screen with delete
- `app/(tabs)/budget/create.example.tsx` - Create budget form

### 3. Documentation
- `services/README.md` - Complete service documentation
- This guide - Implementation instructions

## 🚀 Quick Start

### Step 1: Import the Service

```typescript
import { 
  createBudget,
  getUserBudgets,
  updateBudget,
  deleteBudget,
  getBudgetById
} from '@/services/budgetService';
```

### Step 2: Get User ID from Supabase Auth

```typescript
import { supabase } from '@/lib/supabase';

const { data: { user } } = await supabase.auth.getUser();
if (!user) {
  Alert.alert('Error', 'Please log in');
  return;
}

const userId = user.id;
```

### Step 3: Call Service Functions

```typescript
// Create a budget
const { data, error } = await createBudget(
  userId,
  'Groceries',
  500,
  'monthly',
  '2025-01-01'
);

if (error) {
  Alert.alert('Error', error.message);
} else {
  console.log('Budget created:', data);
}
```

## 📋 Implementation Examples

### Create Budget Screen

See `app/(tabs)/budget/create.example.tsx` for a complete implementation with:
- Form validation
- Loading states
- Quick amount buttons
- Duplicate budget checking
- Error handling
- Success feedback

**Key Features:**
```typescript
// Validate before submitting
const validateInputs = (): string | null => {
  if (!category.trim()) return 'Please enter a category';
  if (!limit || parseFloat(limit) <= 0) return 'Invalid amount';
  return null;
};

// Check for duplicates
const { data: exists } = await budgetExistsForCategory(
  userId,
  category,
  period
);

if (exists) {
  Alert.alert('Budget already exists for this category');
}

// Create budget
const { data, error } = await createBudget(
  userId,
  category,
  parseFloat(limit),
  period,
  startDate
);
```

### Budget List Screen

See `app/(tabs)/budget/index.example.tsx` for a complete implementation with:
- Loading spinner
- Empty state
- Pull-to-refresh
- Delete confirmation
- Error handling

**Key Features:**
```typescript
// Fetch budgets
const loadBudgets = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await getUserBudgets(user.id);
  
  if (error) {
    Alert.alert('Error', error.message);
  } else {
    setBudgets(data || []);
  }
};

// Delete with confirmation
const handleDelete = (id: string, category: string) => {
  Alert.alert(
    'Delete Budget',
    `Delete "${category}"?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await deleteBudget(id);
          if (!error) {
            setBudgets(prev => prev.filter(b => b.id !== id));
          }
        }
      }
    ]
  );
};
```

### Update Budget

```typescript
const handleUpdate = async (budgetId: string) => {
  const { data, error } = await updateBudget(budgetId, {
    limit_amount: 600,
    category: 'Food & Dining'
  });

  if (error) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Success', 'Budget updated');
    // Refresh list
    loadBudgets();
  }
};
```

## 🔍 Error Handling

The service uses a custom error class with specific error codes:

```typescript
import { BudgetServiceError } from '@/services/budgetService';

const { data, error } = await createBudget(...);

if (error) {
  switch (error.code) {
    case 'INVALID_CATEGORY':
      Alert.alert('Error', 'Please enter a category');
      break;
    case 'INVALID_AMOUNT':
      Alert.alert('Error', 'Amount must be greater than 0');
      break;
    case 'INVALID_PERIOD':
      Alert.alert('Error', 'Please select a valid period');
      break;
    case 'INVALID_DATE':
      Alert.alert('Error', 'Please enter a valid date (YYYY-MM-DD)');
      break;
    case 'NOT_FOUND':
      Alert.alert('Error', 'Budget not found');
      break;
    default:
      Alert.alert('Error', error.message);
  }
}
```

### Available Error Codes

| Code | Description |
|------|-------------|
| `INVALID_USER_ID` | User ID is missing |
| `INVALID_CATEGORY` | Category is empty |
| `INVALID_AMOUNT` | Amount is <= 0 |
| `INVALID_PERIOD` | Period is not weekly/monthly/yearly |
| `INVALID_DATE` | Date format is invalid |
| `INVALID_BUDGET_ID` | Budget ID is missing |
| `NO_UPDATES` | No valid updates provided |
| `NOT_FOUND` | Budget not found |
| `UNKNOWN_ERROR` | Unexpected error |

## 🎨 TypeScript Types

All service functions are fully typed:

```typescript
import { Budget, BudgetInsert, BudgetUpdate } from '@/types/database';

// State typing
const [budgets, setBudgets] = useState<Budget[]>([]);
const [currentBudget, setCurrentBudget] = useState<Budget | null>(null);

// Function parameter typing is automatic
const createBudget = async (
  userId: string,
  category: string,
  limitAmount: number,
  period: 'weekly' | 'monthly' | 'yearly',
  startDate: string
) => {
  // TypeScript will enforce correct types
};
```

## 📱 React Native Best Practices

### 1. Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleSubmit = async () => {
  setLoading(true);
  const { data, error } = await createBudget(...);
  setLoading(false);
  
  // Handle result
};

// In render
{loading && <ActivityIndicator />}
```

### 2. Pull to Refresh

```typescript
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  await loadBudgets();
  setRefreshing(false);
};

// In FlatList
<FlatList
  refreshing={refreshing}
  onRefresh={handleRefresh}
/>
```

### 3. User Authentication Check

```typescript
const ensureAuthenticated = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    Alert.alert('Authentication Required', 'Please log in to continue');
    router.push('/auth/login');
    return null;
  }
  
  return user.id;
};

// Use in functions
const loadBudgets = async () => {
  const userId = await ensureAuthenticated();
  if (!userId) return;
  
  const { data, error } = await getUserBudgets(userId);
  // ...
};
```

## 🔧 Common Use Cases

### Filter Budgets by Period

```typescript
import { getBudgetsByPeriod } from '@/services/budgetService';

const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

const loadFilteredBudgets = async () => {
  const userId = await ensureAuthenticated();
  if (!userId) return;

  const { data, error } = await getBudgetsByPeriod(userId, period);
  
  if (data) {
    setBudgets(data);
  }
};

// Update when period changes
useEffect(() => {
  loadFilteredBudgets();
}, [period]);
```

### Check Duplicate Before Creating

```typescript
import { budgetExistsForCategory } from '@/services/budgetService';

const handleCreate = async () => {
  const userId = await ensureAuthenticated();
  if (!userId) return;

  // Check if budget exists
  const { data: exists } = await budgetExistsForCategory(
    userId,
    category,
    period
  );

  if (exists) {
    Alert.alert(
      'Duplicate Budget',
      'You already have a budget for this category and period. Continue anyway?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue', onPress: () => createBudgetNow() }
      ]
    );
    return;
  }

  createBudgetNow();
};
```

### Update Budget Amount

```typescript
const increaseLimit = async (budgetId: string, currentAmount: number) => {
  const newAmount = currentAmount + 100;
  
  const { data, error } = await updateBudget(budgetId, {
    limit_amount: newAmount
  });

  if (error) {
    Alert.alert('Error', error.message);
  } else {
    Alert.alert('Success', `Budget limit increased to $${newAmount}`);
  }
};
```

## 📊 Real-Time Updates (Optional)

To get real-time updates when budgets change:

```typescript
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

useEffect(() => {
  // Subscribe to changes
  const subscription = supabase
    .channel('budgets')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'budgets' 
      }, 
      (payload) => {
        console.log('Budget changed:', payload);
        // Reload budgets
        loadBudgets();
      }
    )
    .subscribe();

  // Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## ✅ Integration Checklist

Before integrating the service into your app:

- [ ] Supabase project created
- [ ] `.env` file configured with Supabase credentials
- [ ] Database migration run (budgets table created)
- [ ] RLS policies enabled
- [ ] User authentication implemented
- [ ] Service layer files created
- [ ] TypeScript types available
- [ ] Test service functions with sample data

## 🧪 Testing the Service

Create a test function to verify everything works:

```typescript
const testBudgetService = async () => {
  console.log('Testing budget service...');
  
  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('❌ User not authenticated');
    return;
  }
  console.log('✅ User authenticated:', user.id);

  // Create budget
  const { data: created, error: createError } = await createBudget(
    user.id,
    'Test Category',
    100,
    'monthly',
    '2025-01-01'
  );
  
  if (createError) {
    console.log('❌ Create failed:', createError.message);
    return;
  }
  console.log('✅ Budget created:', created);

  // Get budgets
  const { data: budgets, error: fetchError } = await getUserBudgets(user.id);
  if (fetchError) {
    console.log('❌ Fetch failed:', fetchError.message);
    return;
  }
  console.log('✅ Fetched budgets:', budgets?.length);

  // Delete test budget
  if (created) {
    const { error: deleteError } = await deleteBudget(created.id);
    if (deleteError) {
      console.log('❌ Delete failed:', deleteError.message);
    } else {
      console.log('✅ Budget deleted');
    }
  }

  console.log('🎉 All tests passed!');
};

// Call in a button press or useEffect
testBudgetService();
```

## 📝 Next Steps

1. **Copy Example Code**: Use `index.example.tsx` and `create.example.tsx` as templates
2. **Customize UI**: Adjust styles to match your app's design
3. **Add Features**: Implement edit budget, budget analytics, etc.
4. **Test Thoroughly**: Test with different user accounts and edge cases
5. **Add Loading States**: Ensure good UX during async operations
6. **Handle Offline**: Add offline support if needed

## 💡 Pro Tips

1. **Cache user ID** after getting it to avoid repeated auth calls
2. **Optimize re-renders** by using `useCallback` for handlers
3. **Add optimistic updates** for better UX
4. **Use React Query** or SWR for better data fetching
5. **Add analytics** to track budget creation/deletion
6. **Implement undo** for delete actions
7. **Add budget templates** for common categories

## 🐛 Troubleshooting

### "User not authenticated"
- Check that user is logged in before calling service
- Verify Supabase auth is set up correctly

### "Budget not found"
- Ensure budget ID is correct
- Check RLS policies allow user to access the budget

### "Failed to create budget"
- Check environment variables are set
- Verify database migration ran successfully
- Check Supabase logs in dashboard

## 📚 Additional Resources

- [Service Documentation](./services/README.md)
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Database Types](./types/database.ts)
- [Supabase Docs](https://supabase.com/docs)

---

Need help? Check the example files or review the service documentation!

