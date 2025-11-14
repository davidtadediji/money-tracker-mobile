# 🎨 Design System Guide

Complete guide to using your Money Tracker app's design system with your custom color palette.

---

## 🌈 Your Color Palette

### Brand Colors
- **Primary Pink** `#F5569B` - Use for primary actions, highlights, active states
- **Secondary Pink** `#FFCBEB` - Use for backgrounds, secondary elements
- **Accent Blue** `#1355B2` - Use for trust elements, information, links

---

## 🎯 Color Usage

### 1. **Primary Pink (#F5569B)**
**When to use:**
- Primary buttons (Save, Create, Confirm)
- Active tab indicators
- Important highlights
- Selected states
- Progress bars (when in good standing)
- Headers and titles

**Examples:**
```typescript
// Primary Button
<TouchableOpacity style={{
  backgroundColor: Colors.light.primary,  // #F5569B
  padding: 16,
  borderRadius: 12
}}>
  <Text style={{ color: Colors.light.onPrimary }}>Save Budget</Text>
</TouchableOpacity>

// Active Tab
<View style={{
  borderBottomWidth: 3,
  borderBottomColor: Colors.light.primary  // #F5569B
}} />
```

### 2. **Secondary Pink (#FFCBEB)**
**When to use:**
- Card backgrounds
- Section backgrounds
- Soft highlights
- Disabled button states
- Subtle accents

**Examples:**
```typescript
// Card with secondary background
<View style={{
  backgroundColor: Colors.light.secondary,  // #FFCBEB
  padding: 20,
  borderRadius: 12
}}>
  <Text style={{ color: Colors.light.onSecondary }}>Budget Card</Text>
</View>

// Section background
<View style={{
  backgroundColor: Colors.light.secondaryLight,  // #FFE5F5
  padding: 16
}} />
```

### 3. **Accent Blue (#1355B2)**
**When to use:**
- Links and hyperlinks
- Info badges
- Trust indicators (bank accounts, security)
- Secondary actions
- Data visualizations

**Examples:**
```typescript
// Link text
<Text style={{
  color: Colors.light.accent,  // #1355B2
  textDecorationLine: 'underline'
}}>Learn More</Text>

// Info badge
<View style={{
  backgroundColor: Colors.light.accent,  // #1355B2
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 16
}}>
  <Text style={{ color: Colors.light.onAccent }}>Verified</Text>
</View>
```

---

## 🧩 Component Examples

### Primary Button

```typescript
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/designTokens';

const PrimaryButton = ({ title, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      backgroundColor: disabled ? Colors.light.secondary : Colors.light.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
      ...Shadows.md,
    }}
  >
    <Text style={{
      color: Colors.light.onPrimary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
    }}>
      {title}
    </Text>
  </TouchableOpacity>
);
```

### Secondary Button

```typescript
const SecondaryButton = ({ title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: Colors.light.primary,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.lg,
      borderRadius: BorderRadius.md,
      alignItems: 'center',
    }}
  >
    <Text style={{
      color: Colors.light.primary,
      fontSize: Typography.fontSize.base,
      fontWeight: Typography.fontWeight.semibold,
    }}>
      {title}
    </Text>
  </TouchableOpacity>
);
```

### Card Component

```typescript
const Card = ({ children, variant = 'default' }) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.light.primaryLight;
      case 'secondary':
        return Colors.light.secondaryLight;
      case 'accent':
        return Colors.light.accentLight;
      default:
        return Colors.light.surface;
    }
  };

  return (
    <View style={{
      backgroundColor: getBackgroundColor(),
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Shadows.md,
    }}>
      {children}
    </View>
  );
};
```

### Badge Component

```typescript
const Badge = ({ label, variant = 'primary' }) => {
  const variants = {
    primary: {
      bg: Colors.light.primary,
      text: Colors.light.onPrimary,
    },
    secondary: {
      bg: Colors.light.secondary,
      text: Colors.light.onSecondary,
    },
    accent: {
      bg: Colors.light.accent,
      text: Colors.light.onAccent,
    },
    success: {
      bg: Colors.light.success,
      text: Colors.light.onPrimary,
    },
  };

  const style = variants[variant];

  return (
    <View style={{
      backgroundColor: style.bg,
      paddingHorizontal: Spacing.sm,
      paddingVertical: 4,
      borderRadius: BorderRadius.full,
    }}>
      <Text style={{
        color: style.text,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
      }}>
        {label}
      </Text>
    </View>
  );
};
```

### Progress Bar

```typescript
const ProgressBar = ({ progress, color = 'primary' }) => {
  const colors = {
    primary: Colors.light.primary,
    accent: Colors.light.accent,
    success: Colors.light.success,
    warning: Colors.light.warning,
  };

  return (
    <View style={{
      height: 8,
      backgroundColor: Colors.light.secondaryLight,
      borderRadius: BorderRadius.full,
      overflow: 'hidden',
    }}>
      <View style={{
        height: '100%',
        width: `${progress}%`,
        backgroundColor: colors[color],
        borderRadius: BorderRadius.full,
      }} />
    </View>
  );
};
```

---

## 🎨 Screen Examples

### Budget Card Example

```typescript
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography, Shadows } from '@/constants/designTokens';

export default function BudgetCard({ budget }) {
  const percentUsed = (budget.spent / budget.limit) * 100;
  
  const getProgressColor = () => {
    if (percentUsed >= 90) return Colors.light.error;
    if (percentUsed >= 70) return Colors.light.warning;
    return Colors.light.primary;
  };

  return (
    <View style={{
      backgroundColor: Colors.light.surface,
      borderRadius: BorderRadius.lg,
      padding: Spacing.md,
      ...Shadows.md,
      marginBottom: Spacing.md,
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
        <Text style={{
          fontSize: Typography.fontSize.lg,
          fontWeight: Typography.fontWeight.semibold,
          color: Colors.light.text,
        }}>
          {budget.category}
        </Text>
        <Badge label={budget.period} variant="accent" />
      </View>

      {/* Amount */}
      <Text style={{
        fontSize: Typography.fontSize.sm,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
      }}>
        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
      </Text>

      {/* Progress Bar */}
      <View style={{
        height: 8,
        backgroundColor: Colors.light.secondaryLight,
        borderRadius: BorderRadius.full,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
      }}>
        <View style={{
          height: '100%',
          width: `${Math.min(percentUsed, 100)}%`,
          backgroundColor: getProgressColor(),
          borderRadius: BorderRadius.full,
        }} />
      </View>

      {/* Footer */}
      <Text style={{
        fontSize: Typography.fontSize.xs,
        color: percentUsed > 100 ? Colors.light.error : Colors.light.success,
        fontWeight: Typography.fontWeight.medium,
      }}>
        {percentUsed > 100 
          ? `Over budget by $${(budget.spent - budget.limit).toFixed(2)}` 
          : `$${(budget.limit - budget.spent).toFixed(2)} remaining`
        }
      </Text>
    </View>
  );
}
```

### Net Worth Dashboard Example

```typescript
export default function NetWorthDashboard({ netWorth, totalAssets, totalLiabilities }) {
  return (
    <View style={{
      backgroundColor: Colors.light.primary,  // Pink background
      borderRadius: BorderRadius.xl,
      padding: Spacing.lg,
      ...Shadows.lg,
      marginBottom: Spacing.lg,
    }}>
      <Text style={{
        fontSize: Typography.fontSize.sm,
        color: Colors.light.onPrimary,
        opacity: 0.9,
        marginBottom: Spacing.xs,
      }}>
        Net Worth
      </Text>

      <Text style={{
        fontSize: Typography.fontSize.hero,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.light.onPrimary,
        marginBottom: Spacing.lg,
      }}>
        ${netWorth.toLocaleString()}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View>
          <Text style={{
            fontSize: Typography.fontSize.xs,
            color: Colors.light.onPrimary,
            opacity: 0.8,
          }}>
            Assets
          </Text>
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.semibold,
            color: Colors.light.onPrimary,
          }}>
            ${totalAssets.toLocaleString()}
          </Text>
        </View>

        <View>
          <Text style={{
            fontSize: Typography.fontSize.xs,
            color: Colors.light.onPrimary,
            opacity: 0.8,
          }}>
            Liabilities
          </Text>
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.semibold,
            color: Colors.light.onPrimary,
          }}>
            ${totalLiabilities.toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
```

---

## 📱 Tab Bar Styling

```typescript
// In your tab bar configuration
import { Colors } from '@/constants/theme';

<Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors.light.primary,  // #F5569B
    tabBarInactiveTintColor: Colors.light.icon,
    tabBarStyle: {
      backgroundColor: Colors.light.surface,
      borderTopColor: Colors.light.border,
    },
  }}
/>
```

---

## 🌓 Dark Mode Support

Your theme automatically supports dark mode:

```typescript
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function MyComponent() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello World</Text>
    </View>
  );
}
```

---

## 🎯 Best Practices

### DO ✅
- Use `primary` (#F5569B) for main actions and highlights
- Use `secondary` (#FFCBEB) for soft backgrounds and cards
- Use `accent` (#1355B2) for links and trust indicators
- Use semantic colors (success, error, warning) for status
- Use the provided design tokens for spacing and typography
- Test in both light and dark mode

### DON'T ❌
- Don't use raw hex codes in components
- Don't mix color systems (always use the theme)
- Don't use primary color for backgrounds (too intense)
- Don't ignore semantic colors for status indicators
- Don't hardcode spacing values

---

## 📦 Quick Import Guide

```typescript
// Import everything you need
import { Colors, BrandColors, SemanticColors } from '@/constants/theme';
import { 
  Spacing, 
  BorderRadius, 
  Typography, 
  Shadows,
  CommonStyles 
} from '@/constants/designTokens';

// Use in your component
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    padding: Spacing.md,
  },
  
  primaryButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    ...Shadows.md,
  },
  
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
});
```

---

## 🎨 Color Psychology

Your chosen colors communicate:

- **Pink (#F5569B)** - Friendly, approachable, modern, energetic
- **Light Pink (#FFCBEB)** - Soft, welcoming, calming
- **Blue (#1355B2)** - Trust, stability, security, professionalism

This palette is perfect for a financial app that wants to feel:
- Modern and friendly (not intimidating)
- Trustworthy and secure
- Energetic and positive about money management

---

## 🔄 Migration from Old Colors

If updating existing components:

```typescript
// Old
backgroundColor: '#0a7ea4'  // ❌

// New
backgroundColor: Colors.light.primary  // ✅ #F5569B
```

---

**Your design system is now ready to use! Build beautiful, consistent UIs with your custom color palette.** 🎉

