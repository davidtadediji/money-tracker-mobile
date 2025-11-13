# Balance Sheet Context - Developer Guide

Complete guide to using the `BalanceSheetContext` for managing assets, liabilities, and net worth in your Money Tracker app.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [State Management](#state-management)
4. [Using the Hook](#using-the-hook)
5. [Asset Operations](#asset-operations)
6. [Liability Operations](#liability-operations)
7. [Calculated Values](#calculated-values)
8. [Auto-Snapshot Creation](#auto-snapshot-creation)
9. [Code Examples](#code-examples)
10. [Error Handling](#error-handling)
11. [Best Practices](#best-practices)

---

## 🎯 Overview

The `BalanceSheetContext` provides:

- ✅ **Global state management** for assets and liabilities
- ✅ **Real-time calculations** for totals and net worth
- ✅ **CRUD operations** for both assets and liabilities
- ✅ **Automatic daily snapshots** for historical tracking
- ✅ **Authentication integration** with Supabase
- ✅ **Loading and error states** for UI feedback
- ✅ **Optimized re-renders** with useMemo

---

## 🚀 Installation

### 1. Provider is Already Configured

The `BalanceSheetProvider` is already included in your `app/_layout.tsx`:

```typescript
<BalanceSheetProvider>
  <BudgetProvider>
    {/* Your app content */}
  </BudgetProvider>
</BalanceSheetProvider>
```

### 2. Import the Hook

In any component, import the hook:

```typescript
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
```

---

## 📊 State Management

### Available State

```typescript
const {
  // Arrays
  assets,              // Asset[] - All user assets
  liabilities,         // Liability[] - All user liabilities
  
  // Calculated values (auto-updated)
  totalAssets,         // number - Sum of all asset values
  totalLiabilities,    // number - Sum of all liability balances
  netWorth,            // number - totalAssets - totalLiabilities
  
  // UI states
  loading,             // boolean - Data fetching status
  error,               // string | null - Error message if any
  
  // Operations
  createAsset,
  updateAsset,
  deleteAsset,
  createLiability,
  updateLiability,
  deleteLiability,
  refresh,
  createSnapshot,
} = useBalanceSheet();
```

---

## 🎣 Using the Hook

### Basic Usage

```typescript
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';

export default function BalanceSheetScreen() {
  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    loading,
    error
  } = useBalanceSheet();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View>
      <Text>Total Assets: ${totalAssets.toFixed(2)}</Text>
      <Text>Total Liabilities: ${totalLiabilities.toFixed(2)}</Text>
      <Text>Net Worth: ${netWorth.toFixed(2)}</Text>
    </View>
  );
}
```

---

## 💼 Asset Operations

### Create Asset

```typescript
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';

function AddAssetForm() {
  const { createAsset } = useBalanceSheet();
  
  const handleSubmit = async () => {
    const result = await createAsset({
      name: 'Savings Account',
      type: 'bank',
      current_value: 10000,
      currency: 'USD',
      description: 'Emergency fund'
    });

    if (result.success) {
      Alert.alert('Success', 'Asset created successfully!');
      // result.asset contains the new asset
    } else {
      Alert.alert('Error', result.error || 'Failed to create asset');
    }
  };

  return <Button onPress={handleSubmit} title="Add Asset" />;
}
```

**Asset Types:**
- `'cash'` - Physical cash
- `'bank'` - Bank accounts, checking/savings
- `'investment'` - Stocks, bonds, 401k, IRA
- `'property'` - Real estate, vehicles
- `'other'` - Other assets

### Update Asset

```typescript
const { updateAsset } = useBalanceSheet();

const handleUpdate = async (assetId: string) => {
  const result = await updateAsset(assetId, {
    current_value: 12000,  // Update value
    description: 'Updated description'
  });

  if (result.success) {
    console.log('Updated asset:', result.asset);
  }
};
```

### Delete Asset

```typescript
const { deleteAsset } = useBalanceSheet();

const handleDelete = async (assetId: string) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure you want to delete this asset?',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteAsset(assetId);
          if (result.success) {
            Alert.alert('Success', 'Asset deleted');
          } else {
            Alert.alert('Error', result.error);
          }
        }
      }
    ]
  );
};
```

### Display Assets List

```typescript
function AssetsList() {
  const { assets, loading } = useBalanceSheet();

  if (loading) return <ActivityIndicator />;

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.assetCard}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.type}>{item.type}</Text>
          <Text style={styles.value}>
            ${item.current_value.toLocaleString()}
          </Text>
        </View>
      )}
    />
  );
}
```

---

## 💳 Liability Operations

### Create Liability

```typescript
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';

function AddLiabilityForm() {
  const { createLiability } = useBalanceSheet();
  
  const handleSubmit = async () => {
    const result = await createLiability({
      name: 'Credit Card',
      type: 'credit_card',
      current_balance: 2500,
      interest_rate: 18.99,
      currency: 'USD',
      due_date: '2025-02-15',
      minimum_payment: 75,
      description: 'Chase Freedom Unlimited'
    });

    if (result.success) {
      Alert.alert('Success', 'Liability added!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return <Button onPress={handleSubmit} title="Add Liability" />;
}
```

**Liability Types:**
- `'credit_card'` - Credit cards
- `'loan'` - Personal loans, car loans, student loans
- `'mortgage'` - Home mortgages
- `'other'` - Other debts

### Update Liability

```typescript
const { updateLiability } = useBalanceSheet();

const handlePayment = async (liabilityId: string, paymentAmount: number) => {
  // Get current balance
  const liability = liabilities.find(l => l.id === liabilityId);
  if (!liability) return;

  const newBalance = liability.current_balance - paymentAmount;

  const result = await updateLiability(liabilityId, {
    current_balance: newBalance
  });

  if (result.success) {
    Alert.alert('Payment Recorded', `New balance: $${newBalance}`);
  }
};
```

### Delete Liability

```typescript
const { deleteLiability } = useBalanceSheet();

const handleDelete = async (liabilityId: string) => {
  const result = await deleteLiability(liabilityId);
  if (result.success) {
    Alert.alert('Success', 'Liability removed');
  }
};
```

### Display Liabilities with Due Dates

```typescript
function LiabilitiesList() {
  const { liabilities, loading } = useBalanceSheet();

  if (loading) return <ActivityIndicator />;

  // Sort by due date
  const sortedLiabilities = [...liabilities].sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });

  return (
    <FlatList
      data={sortedLiabilities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View style={styles.liabilityCard}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.balance}>
            ${item.current_balance.toLocaleString()}
          </Text>
          {item.interest_rate && (
            <Text style={styles.rate}>{item.interest_rate}% APR</Text>
          )}
          {item.due_date && (
            <Text style={styles.dueDate}>
              Due: {new Date(item.due_date).toLocaleDateString()}
            </Text>
          )}
          {item.minimum_payment && (
            <Text style={styles.minPayment}>
              Min Payment: ${item.minimum_payment}
            </Text>
          )}
        </View>
      )}
    />
  );
}
```

---

## 📈 Calculated Values

All calculated values are **automatically updated** when assets or liabilities change:

```typescript
function NetWorthCard() {
  const { totalAssets, totalLiabilities, netWorth } = useBalanceSheet();

  const netWorthColor = netWorth >= 0 ? 'green' : 'red';

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.label}>Total Assets</Text>
        <Text style={[styles.value, styles.positive]}>
          ${totalAssets.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
      
      <View style={styles.row}>
        <Text style={styles.label}>Total Liabilities</Text>
        <Text style={[styles.value, styles.negative]}>
          ${totalLiabilities.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
      
      <View style={[styles.row, styles.divider]}>
        <Text style={styles.labelLarge}>Net Worth</Text>
        <Text style={[styles.valueLarge, { color: netWorthColor }]}>
          ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
      </View>
    </View>
  );
}
```

### Assets by Type

```typescript
function AssetsByType() {
  const { assets } = useBalanceSheet();

  const assetsByType = assets.reduce((acc, asset) => {
    acc[asset.type] = (acc[asset.type] || 0) + asset.current_value;
    return acc;
  }, {} as Record<string, number>);

  return (
    <View>
      {Object.entries(assetsByType).map(([type, total]) => (
        <View key={type} style={styles.row}>
          <Text>{type}</Text>
          <Text>${total.toLocaleString()}</Text>
        </View>
      ))}
    </View>
  );
}
```

---

## 📸 Auto-Snapshot Creation

### Automatic Snapshots

Snapshots are **automatically created** in the following scenarios:

1. ✅ **On app mount** (when user logs in)
2. ✅ **After creating** an asset or liability
3. ✅ **After updating** an asset or liability
4. ✅ **After deleting** an asset or liability

**Note:** Only **one snapshot per day** is created (duplicate prevention built-in).

### Manual Snapshot Creation

```typescript
function SnapshotButton() {
  const { createSnapshot } = useBalanceSheet();

  const handleSnapshot = async () => {
    const result = await createSnapshot();
    
    if (result.success) {
      Alert.alert('Success', 'Snapshot created!');
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <Button 
      onPress={handleSnapshot} 
      title="Create Snapshot"
    />
  );
}
```

### Accessing Historical Snapshots

To get historical data, query the `balance_snapshots` table directly:

```typescript
import { supabase } from '@/lib/supabase';

async function getNetWorthHistory(userId: string, days: number = 30) {
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

---

## 💡 Code Examples

### Complete Balance Sheet Screen

```typescript
import { useBalanceSheet } from '@/contexts/BalanceSheetContext';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function BalanceSheetScreen() {
  const {
    assets,
    liabilities,
    totalAssets,
    totalLiabilities,
    netWorth,
    loading,
    error,
    refresh
  } = useBalanceSheet();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Net Worth Summary */}
      <View style={styles.summary}>
        <Text style={styles.summaryTitle}>Net Worth</Text>
        <Text style={[styles.netWorth, netWorth >= 0 ? styles.positive : styles.negative]}>
          ${netWorth.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </Text>
        <View style={styles.breakdown}>
          <View>
            <Text style={styles.label}>Assets</Text>
            <Text style={styles.positiveAmount}>${totalAssets.toLocaleString()}</Text>
          </View>
          <View>
            <Text style={styles.label}>Liabilities</Text>
            <Text style={styles.negativeAmount}>${totalLiabilities.toLocaleString()}</Text>
          </View>
        </View>
      </View>

      {/* Assets Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Assets ({assets.length})</Text>
        {assets.map(asset => (
          <View key={asset.id} style={styles.card}>
            <Text style={styles.itemName}>{asset.name}</Text>
            <Text style={styles.itemValue}>${asset.current_value.toLocaleString()}</Text>
          </View>
        ))}
      </View>

      {/* Liabilities Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Liabilities ({liabilities.length})</Text>
        {liabilities.map(liability => (
          <View key={liability.id} style={styles.card}>
            <Text style={styles.itemName}>{liability.name}</Text>
            <Text style={styles.itemValue}>${liability.current_balance.toLocaleString()}</Text>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  summary: { backgroundColor: 'white', padding: 20, marginBottom: 20 },
  summaryTitle: { fontSize: 16, color: '#666', textAlign: 'center' },
  netWorth: { fontSize: 36, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  positive: { color: 'green' },
  negative: { color: 'red' },
  breakdown: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  label: { fontSize: 14, color: '#666', textAlign: 'center' },
  positiveAmount: { fontSize: 18, fontWeight: 'bold', color: 'green', textAlign: 'center', marginTop: 5 },
  negativeAmount: { fontSize: 18, fontWeight: 'bold', color: 'red', textAlign: 'center', marginTop: 5 },
  section: { marginBottom: 20, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: { backgroundColor: 'white', padding: 15, borderRadius: 8, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { fontSize: 16 },
  itemValue: { fontSize: 16, fontWeight: 'bold' },
  error: { color: 'red', fontSize: 16 },
});
```

---

## ⚠️ Error Handling

All operations return a result object with success status and error message:

```typescript
const result = await createAsset({...});

if (result.success) {
  // Success case
  console.log('Asset created:', result.asset);
} else {
  // Error case
  console.error('Error:', result.error);
  Alert.alert('Error', result.error || 'An error occurred');
}
```

### Common Error Scenarios

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `INVALID_USER_ID` | User not authenticated | Ensure user is logged in |
| `INVALID_NAME` | Empty name provided | Validate input before submitting |
| `INVALID_VALUE` | Negative value | Ensure value is positive |
| `INVALID_TYPE` | Invalid asset/liability type | Use valid type constants |
| `NOT_FOUND` | Item doesn't exist | Check if item was deleted |
| `FETCH_FAILED` | Database error | Check network/Supabase connection |

---

## ✅ Best Practices

### 1. Always Check Loading State

```typescript
if (loading) {
  return <ActivityIndicator />;
}
```

### 2. Handle Errors Gracefully

```typescript
if (error) {
  return (
    <View>
      <Text>{error}</Text>
      <Button onPress={refresh} title="Retry" />
    </View>
  );
}
```

### 3. Use Pull-to-Refresh

```typescript
<FlatList
  data={assets}
  refreshing={loading}
  onRefresh={refresh}
  renderItem={renderAsset}
/>
```

### 4. Validate Before Submitting

```typescript
const handleSubmit = async () => {
  if (!name.trim()) {
    Alert.alert('Error', 'Name is required');
    return;
  }
  
  if (value <= 0) {
    Alert.alert('Error', 'Value must be positive');
    return;
  }

  const result = await createAsset({ name, type, current_value: value });
  // ...
};
```

### 5. Confirm Destructive Actions

```typescript
const handleDelete = (id: string) => {
  Alert.alert(
    'Confirm Delete',
    'Are you sure?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteAsset(id), style: 'destructive' }
    ]
  );
};
```

### 6. Use Optimistic Updates (Optional)

For better UX, update UI immediately and revert on error:

```typescript
const handleUpdate = async (id: string, updates: AssetUpdate) => {
  // Optimistically update local state
  const oldAssets = [...assets];
  setLocalAssets(assets.map(a => a.id === id ? { ...a, ...updates } : a));

  const result = await updateAsset(id, updates);
  
  if (!result.success) {
    // Revert on error
    setLocalAssets(oldAssets);
    Alert.alert('Error', result.error);
  }
};
```

---

## 🎯 Next Steps

1. **Build Balance Sheet UI** - Create screens for viewing and managing assets/liabilities
2. **Add Charts** - Visualize net worth trends using balance snapshots
3. **Payment Reminders** - Use `due_date` for notifications
4. **Multi-Currency** - Support multiple currencies with conversion
5. **Asset Categories** - Group assets by custom categories
6. **Liability Payoff Calculator** - Calculate time to pay off debts

---

## 📚 Related Documentation

- [Balance Sheet Setup Guide](../supabase/BALANCE_SHEET_SETUP.md)
- [Balance Sheet Service](../services/balanceSheetService.ts)
- [Database Types](../types/database.ts)

---

**Created:** January 27, 2025  
**Status:** ✅ Production Ready  
**Version:** 1.0.0

