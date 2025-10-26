# Budget Context Integration Examples

This directory contains example code for integrating BudgetContext into your app.

## Files

- `_layout-with-provider.tsx` - Root layout with BudgetProvider
- `budget-list-with-context.tsx` - Budget list screen using useBudget hook
- `create-budget-with-context.tsx` - Create budget form using useBudget hook

## How to Use

1. Copy the relevant code from these examples
2. Paste into your actual app files
3. Adjust styling and logic as needed

**Important:** These are reference files only. Do not move them into the `app` directory as they will conflict with Expo Router.

## Quick Integration

### Step 1: Update app/_layout.tsx

Add BudgetProvider wrapper (see `_layout-with-provider.tsx`):

```typescript
import { BudgetProvider } from '@/contexts/BudgetContext';

export default function RootLayout() {
  return (
    <BudgetProvider>
      {/* Your existing layout */}
    </BudgetProvider>
  );
}
```

### Step 2: Update app/(tabs)/budget/index.tsx

Replace with code from `budget-list-with-context.tsx`

### Step 3: Update app/(tabs)/budget/create.tsx

Replace with code from `create-budget-with-context.tsx`

---

For detailed instructions, see [CONTEXT_INTEGRATION_GUIDE.md](../../CONTEXT_INTEGRATION_GUIDE.md)

