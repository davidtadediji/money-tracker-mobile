# Budget Service Layer

This directory contains the service layer for the Money Tracker Mobile app. Services encapsulate business logic and data access, providing a clean API for the UI components.

## Budget Service (`budgetService.ts`)

The budget service provides a complete set of functions for managing budgets with proper error handling and TypeScript types.

### Features

- ✅ Full TypeScript type safety
- ✅ Comprehensive error handling with custom error class
- ✅ Input validation
- ✅ Consistent response format
- ✅ RLS (Row Level Security) compatible

### Core Functions

#### 1. `createBudget(userId, category, limitAmount, period, startDate)`

Creates a new budget for a user.

**Parameters:**
- `userId` (string) - User ID from auth.users
- `category` (string) - Expense category name (e.g., "Groceries")
- `limitAmount` (number) - Budget limit amount (must be > 0)
- `period` ('weekly' | 'monthly' | 'yearly') - Budget period
- `startDate` (string) - Budget start date in YYYY-MM-DD format

**Returns:** `ServiceResponse<Budget>`

**Example:**
```typescript
import { createBudget } from '@/services/budgetService';

const { data, error } = await createBudget(
  userId,
  'Groceries',
  500,
  'monthly',
  '2025-01-01'
);

if (error) {
  console.error('Failed to create budget:', error.message);
  return;
}

console.log('Budget created:', data);
```

#### 2. `getUserBudgets(userId)`

Fetches all budgets for a user, sorted by creation date (newest first).

**Parameters:**
- `userId` (string) - User ID to fetch budgets for

**Returns:** `ServiceResponse<Budget[]>`

**Example:**
```typescript
import { getUserBudgets } from '@/services/budgetService';

const { data, error } = await getUserBudgets(userId);

if (error) {
  console.error('Failed to fetch budgets:', error.message);
  return;
}

console.log(`Found ${data?.length} budgets`);
```

#### 3. `updateBudget(budgetId, updates)`

Updates an existing budget. Only allows updating: category, limit_amount, and period.

**Parameters:**
- `budgetId` (string) - Budget ID to update
- `updates` (object) - Fields to update:
  - `category?` (string)
  - `limit_amount?` (number)
  - `period?` ('weekly' | 'monthly' | 'yearly')

**Returns:** `ServiceResponse<Budget>`

**Example:**
```typescript
import { updateBudget } from '@/services/budgetService';

const { data, error } = await updateBudget(budgetId, {
  limit_amount: 600,
  category: 'Food & Dining'
});

if (error) {
  console.error('Failed to update budget:', error.message);
  return;
}

console.log('Budget updated:', data);
```

#### 4. `deleteBudget(budgetId)`

Deletes a budget (hard delete from database).

**Parameters:**
- `budgetId` (string) - Budget ID to delete

**Returns:** `ServiceResponse<{ success: true }>`

**Example:**
```typescript
import { deleteBudget } from '@/services/budgetService';

const { data, error } = await deleteBudget(budgetId);

if (error) {
  console.error('Failed to delete budget:', error.message);
  return;
}

console.log('Budget deleted successfully');
```

#### 5. `getBudgetById(budgetId)`

Fetches a single budget by ID.

**Parameters:**
- `budgetId` (string) - Budget ID to fetch

**Returns:** `ServiceResponse<Budget>`

**Example:**
```typescript
import { getBudgetById } from '@/services/budgetService';

const { data, error } = await getBudgetById(budgetId);

if (error) {
  console.error('Failed to fetch budget:', error.message);
  return;
}

console.log('Budget:', data);
```

### Helper Functions

#### `getBudgetsByPeriod(userId, period)`

Fetches budgets filtered by period.

**Example:**
```typescript
import { getBudgetsByPeriod } from '@/services/budgetService';

const { data, error } = await getBudgetsByPeriod(userId, 'monthly');
```

#### `budgetExistsForCategory(userId, category, period)`

Checks if a budget exists for a specific category and period.

**Example:**
```typescript
import { budgetExistsForCategory } from '@/services/budgetService';

const { data, error } = await budgetExistsForCategory(
  userId,
  'Groceries',
  'monthly'
);

if (data) {
  console.log('Budget already exists for this category');
}
```

## Error Handling

All service functions return a consistent `ServiceResponse<T>` object:

```typescript
interface ServiceResponse<T> {
  data: T | null;
  error: BudgetServiceError | null;
}
```

### BudgetServiceError

Custom error class with additional context:

```typescript
class BudgetServiceError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: any
  )
}
```

**Error Codes:**
- `INVALID_USER_ID` - User ID is missing or invalid
- `INVALID_CATEGORY` - Category is empty or invalid
- `INVALID_AMOUNT` - Amount is <= 0
- `INVALID_PERIOD` - Period is not weekly/monthly/yearly
- `INVALID_DATE` - Date format is invalid
- `INVALID_BUDGET_ID` - Budget ID is missing
- `NO_UPDATES` - No valid fields to update
- `NOT_FOUND` - Budget not found
- `UNKNOWN_ERROR` - Unexpected error occurred

### Error Handling Example

```typescript
import { createBudget, BudgetServiceError } from '@/services/budgetService';

const { data, error } = await createBudget(userId, category, amount, period, date);

if (error) {
  switch (error.code) {
    case 'INVALID_CATEGORY':
      Alert.alert('Invalid Input', 'Please enter a valid category');
      break;
    case 'INVALID_AMOUNT':
      Alert.alert('Invalid Input', 'Amount must be greater than 0');
      break;
    case 'NOT_FOUND':
      Alert.alert('Error', 'Budget not found');
      break;
    default:
      Alert.alert('Error', error.message);
  }
  return;
}

// Success - use data
console.log('Budget created:', data);
```

## Usage in React Native Components

### With React Hooks

```typescript
import { useState, useEffect } from 'react';
import { getUserBudgets, createBudget } from '@/services/budgetService';
import { supabase } from '@/lib/supabase';

function BudgetList() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await getUserBudgets(user.id);
    
    if (error) {
      console.error('Failed to load budgets:', error.message);
    } else {
      setBudgets(data || []);
    }
    
    setLoading(false);
  };

  const handleCreateBudget = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await createBudget(
      user.id,
      'Groceries',
      500,
      'monthly',
      '2025-01-01'
    );

    if (error) {
      Alert.alert('Error', error.message);
      return;
    }

    // Reload budgets
    loadBudgets();
  };

  // ... render component
}
```

## Best Practices

1. **Always check for errors** before using data:
   ```typescript
   if (error) {
     // Handle error
     return;
   }
   // Use data safely
   ```

2. **Get user from auth** before calling service functions:
   ```typescript
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) {
     // Handle unauthenticated state
     return;
   }
   ```

3. **Validate input** before calling service (optional, service validates too):
   ```typescript
   if (!category.trim()) {
     Alert.alert('Error', 'Category is required');
     return;
   }
   ```

4. **Use TypeScript types** for better autocomplete:
   ```typescript
   import { Budget } from '@/types/database';
   
   const [budgets, setBudgets] = useState<Budget[]>([]);
   ```

5. **Handle loading states** in UI:
   ```typescript
   const [loading, setLoading] = useState(false);
   
   setLoading(true);
   const { data, error } = await createBudget(...);
   setLoading(false);
   ```

## Testing

You can test the service functions in the Expo console:

```typescript
// In any component or screen
import { createBudget, getUserBudgets } from '@/services/budgetService';
import { supabase } from '@/lib/supabase';

const testBudgetService = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.log('User not authenticated');
    return;
  }

  // Test creating a budget
  const { data, error } = await createBudget(
    user.id,
    'Test Category',
    100,
    'monthly',
    '2025-01-01'
  );

  console.log('Create result:', { data, error });

  // Test fetching budgets
  const { data: budgets, error: fetchError } = await getUserBudgets(user.id);
  console.log('Fetch result:', { budgets, fetchError });
};
```

## Migration from lib/budgets.ts

If you were using the previous `lib/budgets.ts`, here's how to migrate:

**Old:**
```typescript
import { createBudget } from '@/lib/budgets';

const budget = {
  category: 'Groceries',
  limit_amount: 500,
  period: 'monthly',
  start_date: '2025-01-01'
};

const { data, error } = await createBudget(budget);
```

**New:**
```typescript
import { createBudget } from '@/services/budgetService';

const { data: { user } } = await supabase.auth.getUser();

const { data, error } = await createBudget(
  user.id,
  'Groceries',
  500,
  'monthly',
  '2025-01-01'
);
```

The new service layer provides:
- Better error handling with custom error codes
- More explicit function signatures
- Input validation
- Consistent response format
- Better TypeScript support

