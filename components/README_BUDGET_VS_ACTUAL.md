# BudgetVsActual Component

## Overview

The `BudgetVsActual` component provides real-time budget tracking by comparing budget limits against actual spending from transactions. It features an animated progress bar, color-coded visual indicators, and smart alerts for budget management.

## Features

### 1. **Automatic Transaction Fetching**
- Fetches transactions from Supabase for the specified category
- Filters by current budget period (weekly/monthly/yearly)
- Calculates date ranges based on budget start date
- Only counts expenses (not income)

### 2. **Smart Calculations**
- **Spent**: Total expenses in current period
- **Remaining**: Budget limit minus spent amount
- **Percent Used**: (Spent / Limit) × 100

### 3. **Visual Indicators**

#### Progress Bar Colors
- 🟢 **Green** (< 70%): Spending is under control
- 🟡 **Yellow** (70-90%): Approaching budget limit
- 🔴 **Red** (> 90%): Near or over budget

#### Amount Colors
- 🟢 **Green**: Positive remaining balance
- 🔴 **Red**: Budget exceeded

### 4. **Smart Alerts**

- **🚨 Over Budget**: Shows when budget is exceeded with exact overage amount
- **⚠️ Warning**: Alerts when 90%+ of budget is used
- **ℹ️ No Expenses**: Displays message when no transactions recorded yet

### 5. **Animated Progress Bar**
- Smooth 800ms animation on load
- Caps at 100% visually (even if budget exceeded)
- Color transitions based on usage percentage

## Usage

```tsx
import BudgetVsActual from '@/components/BudgetVsActual';

<BudgetVsActual
  budgetId="budget-uuid"
  category="Groceries"
  limitAmount={500}
  period="monthly"
  startDate="2025-01-01"
/>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `budgetId` | `string` | Yes | Unique identifier for the budget |
| `category` | `string` | Yes | Category name to match transactions |
| `limitAmount` | `number` | Yes | Budget limit amount |
| `period` | `'weekly' \| 'monthly' \| 'yearly'` | Yes | Budget time period |
| `startDate` | `string` | Yes | Budget start date (YYYY-MM-DD) |

## Period Calculation Logic

### Weekly
- Calculates how many complete weeks have passed since start date
- Shows data for the current week cycle

### Monthly
- Uses the same day of month as start date
- Shows data for current month period

### Yearly
- Uses the same month and day as start date
- Shows data for current year period

## Requirements

### Database Setup

The component requires a `transactions` table in Supabase:

```sql
-- Run the migration file:
supabase/migrations/20250126_create_transactions_table.sql
```

**Transaction Schema:**
- `id`: UUID (primary key)
- `user_id`: UUID (foreign key to auth.users)
- `category`: TEXT (must match budget category)
- `amount`: NUMERIC (positive value)
- `date`: DATE (transaction date)
- `description`: TEXT (optional)
- `type`: 'expense' | 'income'
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### Authentication

- User must be authenticated (uses `supabase.auth.getUser()`)
- Row Level Security policies enforce user-specific data access

## States

### Loading
```tsx
<View>
  <ActivityIndicator />
  <Text>Loading spending data...</Text>
</View>
```

### Error
```tsx
<View>
  <Text>⚠️</Text>
  <Text>Failed to load spending data</Text>
</View>
```

### Loaded
Displays full budget tracking interface with all features.

## Edge Cases Handled

1. **No transactions**: Shows informative message
2. **Budget exceeded**: Visual alert with overage amount
3. **Near limit**: Warning when 90%+ used
4. **Invalid data**: Error state with message
5. **Authentication failure**: Error message
6. **Date range edge cases**: Handles leap years, month boundaries

## Styling

The component uses modern, clean design matching the app's theme:
- White background with subtle shadow
- Color-coded progress indicators
- Responsive layout
- Consistent typography

## Integration Example

### In Budget List (index.tsx)

```tsx
const renderBudgetCard = ({ item }: { item: Budget }) => {
  return (
    <View>
      <BudgetVsActual
        budgetId={item.id}
        category={item.category}
        limitAmount={item.limit_amount}
        period={item.period}
        startDate={item.start_date}
      />
      {/* Additional UI elements */}
    </View>
  );
};
```

## Performance Considerations

- Fetches data on component mount and when props change
- Uses React hooks for efficient state management
- Animated progress bar uses `useNativeDriver: false` (required for width animations)
- Queries are optimized with proper indexes

## Future Enhancements

Potential improvements:
- Real-time updates using Supabase subscriptions
- Drill-down to view individual transactions
- Export budget report
- Historical comparison (this period vs last period)
- Multiple category support in single component

## Troubleshooting

### "Failed to load spending data"
- Check Supabase connection
- Verify transactions table exists
- Ensure user is authenticated
- Check RLS policies are enabled

### Progress bar not animating
- Verify React Native Animated is properly imported
- Check that limitAmount > 0

### No transactions showing but they exist
- Verify category names match exactly (case-sensitive)
- Check date ranges are calculated correctly
- Ensure transaction type is 'expense' not 'income'

## Related Files

- `/types/database.ts` - Transaction and Budget types
- `/lib/supabase.ts` - Supabase client configuration
- `/app/(tabs)/budget/index.tsx` - Budget list implementation
- `/supabase/migrations/20250126_create_transactions_table.sql` - Database migration

