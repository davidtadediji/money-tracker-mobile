# 🎨 Modern UI Guide

Complete guide to building sleek, modern interfaces inspired by top fintech apps.

---

## 🌟 Modern Design Features

### ✨ Glassmorphism
Semi-transparent cards with blur effects for a frosted glass appearance

### 🌈 Gradients
Smooth color transitions for eye-catching backgrounds

### 💫 Bold Typography
Large, heavy fonts for better readability and impact

### 🎯 Rounded Corners
Extra-rounded borders for a softer, modern look

### ✨ Soft Shadows
Subtle shadows with color tints for depth

---

## 🎯 Key Components

### 1. **Balance Card** - Hero Display

Large, gradient card prominently displaying the main balance.

```typescript
import BalanceCard from '@/components/BalanceCard';

<BalanceCard
  balance={481296.89}
  currency="$"
  title="AVAILABLE BALANCE"
  subtitle="Updated just now"
  showEyeIcon={true}
  onEyePress={() => console.log('Toggle visibility')}
/>
```

**Features:**
- ✅ Pink → Purple gradient background
- ✅ Huge, bold balance display (56px font)
- ✅ Decorative circular elements
- ✅ Glowing shadow effect
- ✅ Eye icon to toggle visibility

---

### 2. **Glass Card** - Semi-Transparent Cards

Modern glassmorphism cards with blur effects.

```typescript
import GlassCard from '@/components/ui/GlassCard';

// Light glass
<GlassCard variant="light" padding="lg">
  <Text>Asset information</Text>
</GlassCard>

// Pink tinted glass
<GlassCard variant="pink" padding="md">
  <Text>Budget overview</Text>
</GlassCard>

// Blue tinted glass
<GlassCard variant="blue" padding="lg">
  <Text>Bank accounts</Text>
</GlassCard>
```

**Variants:**
- `light` - White frosted glass
- `medium` - More transparent white
- `dark` - Dark frosted glass
- `pink` - Pink tinted glass (#F5569B)
- `blue` - Blue tinted glass (#1355B2)

---

### 3. **Gradient Card** - Bold Backgrounds

Cards with smooth gradient backgrounds.

```typescript
import GradientCard from '@/components/ui/GradientCard';
import { Gradients } from '@/constants/designTokens';

// Pink to Purple gradient
<GradientCard
  colors={Gradients.pinkPurple.colors}
  start={Gradients.pinkPurple.start}
  end={Gradients.pinkPurple.end}
  padding="xl"
>
  <Text style={{ color: 'white' }}>Premium Content</Text>
</GradientCard>

// Pink to Blue gradient
<GradientCard colors={Gradients.pinkBlue.colors}>
  <Text>Financial Summary</Text>
</GradientCard>
```

**Available Gradients:**
- `pinkPurple` - Pink → Purple diagonal
- `pinkBlue` - Pink → Blue diagonal
- `bluePurple` - Blue → Purple diagonal
- `lightPink` - Light Pink → Pink vertical
- `darkGradient` - Dark Gray vertical
- `success` - Green horizontal

---

### 4. **Modern Button** - Multiple Styles

Sleek buttons with gradients and glass effects.

```typescript
import ModernButton from '@/components/ui/ModernButton';

// Gradient button (primary action)
<ModernButton
  title="Save Budget"
  variant="gradient"
  size="lg"
  onPress={handleSave}
/>

// Glass button (secondary action)
<ModernButton
  title="View Details"
  variant="glass"
  size="md"
  onPress={handleView}
/>

// Outline button (tertiary action)
<ModernButton
  title="Cancel"
  variant="outline"
  size="md"
  onPress={handleCancel}
/>

// With icon
<ModernButton
  title="Add Transaction"
  variant="gradient"
  icon={<Text style={{ fontSize: 20 }}>+</Text>}
  onPress={handleAdd}
/>

// Loading state
<ModernButton
  title="Processing..."
  variant="gradient"
  loading={true}
  onPress={() => {}}
/>
```

**Variants:**
- `gradient` - Pink → Purple gradient (primary actions)
- `glass` - Frosted glass effect (secondary actions)
- `solid` - Solid pink background
- `outline` - Transparent with pink border

**Sizes:** `sm`, `md`, `lg`

---

## 🎨 Modern UI Patterns

### Pattern 1: Dashboard Hero Card

```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/theme';
import { Typography, Spacing, BorderRadius, ModernShadows } from '@/constants/designTokens';

export default function DashboardHero({ netWorth }) {
  return (
    <LinearGradient
      colors={['#F5569B', '#B855D4']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: BorderRadius.xxl,
        padding: Spacing.xl,
        margin: Spacing.md,
        ...ModernShadows.glow,
      }}
    >
      <Text style={{
        fontSize: Typography.fontSize.xs,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: Typography.fontWeight.semibold,
        letterSpacing: Typography.letterSpacing.wide,
        marginBottom: Spacing.sm,
      }}>
        NET WORTH
      </Text>

      <Text style={{
        fontSize: Typography.fontSize.hero,
        fontWeight: Typography.fontWeight.black,
        color: '#fff',
        letterSpacing: Typography.letterSpacing.tight,
      }}>
        ${netWorth.toLocaleString()}
      </Text>
    </LinearGradient>
  );
}
```

---

### Pattern 2: Glass Card with Content

```typescript
import GlassCard from '@/components/ui/GlassCard';
import { Typography, Spacing } from '@/constants/designTokens';

export default function StatsCard({ title, value, change }) {
  return (
    <GlassCard variant="light" padding="lg">
      <Text style={{
        fontSize: Typography.fontSize.sm,
        color: Colors.light.textSecondary,
        marginBottom: Spacing.xs,
      }}>
        {title}
      </Text>

      <Text style={{
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.light.text,
        marginBottom: Spacing.xs,
      }}>
        {value}
      </Text>

      <Text style={{
        fontSize: Typography.fontSize.sm,
        color: change > 0 ? Colors.light.success : Colors.light.error,
        fontWeight: Typography.fontWeight.medium,
      }}>
        {change > 0 ? '↑' : '↓'} {Math.abs(change)}%
      </Text>
    </GlassCard>
  );
}
```

---

### Pattern 3: Action Button Grid

```typescript
import ModernButton from '@/components/ui/ModernButton';
import { Spacing } from '@/constants/designTokens';

export default function QuickActions() {
  return (
    <View style={{
      flexDirection: 'row',
      gap: Spacing.md,
      padding: Spacing.md,
    }}>
      <View style={{ flex: 1 }}>
        <ModernButton
          title="Send"
          variant="glass"
          icon={<Text>↗️</Text>}
          onPress={handleSend}
        />
      </View>

      <View style={{ flex: 1 }}>
        <ModernButton
          title="Receive"
          variant="glass"
          icon={<Text>↙️</Text>}
          onPress={handleReceive}
        />
      </View>

      <View style={{ flex: 1 }}>
        <ModernButton
          title="Buy"
          variant="gradient"
          icon={<Text>+</Text>}
          onPress={handleBuy}
        />
      </View>
    </View>
  );
}
```

---

### Pattern 4: Asset List with Glass Cards

```typescript
import GlassCard from '@/components/ui/GlassCard';

export default function AssetList({ assets }) {
  return (
    <FlatList
      data={assets}
      renderItem={({ item }) => (
        <GlassCard
          variant="light"
          padding="md"
          style={{ marginBottom: Spacing.sm }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
              }}>
                {item.icon} {item.name}
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.sm,
                color: Colors.light.textSecondary,
              }}>
                {item.amount} {item.symbol}
              </Text>
            </View>
            
            <Text style={{
              fontSize: Typography.fontSize.lg,
              fontWeight: Typography.fontWeight.bold,
            }}>
              ${item.value.toLocaleString()}
            </Text>
          </View>
        </GlassCard>
      )}
    />
  );
}
```

---

## 🎯 Typography Scale

Modern, bold typography for impact:

```typescript
import { Typography } from '@/constants/designTokens';

// Balance displays
fontSize: Typography.fontSize.hero    // 56px - Main balance
fontSize: Typography.fontSize.mega    // 72px - Extra large

// Titles
fontSize: Typography.fontSize.xxxl   // 34px - Section titles
fontSize: Typography.fontSize.xxl    // 28px - Card titles

// Body text
fontSize: Typography.fontSize.base   // 15px - Regular text
fontSize: Typography.fontSize.md     // 17px - Emphasis text

// Labels
fontSize: Typography.fontSize.xs     // 11px - Small labels
fontSize: Typography.fontSize.sm     // 13px - Labels

// Weights
fontWeight: Typography.fontWeight.black     // 900 - Hero text
fontWeight: Typography.fontWeight.extrabold // 800 - Very important
fontWeight: Typography.fontWeight.bold      // 700 - Titles
fontWeight: Typography.fontWeight.semibold  // 600 - Subtitles
```

---

## 🔄 Border Radius

Extra rounded for modern look:

```typescript
import { BorderRadius } from '@/constants/designTokens';

borderRadius: BorderRadius.xxl    // 28px - Large cards
borderRadius: BorderRadius.xl     // 20px - Standard cards  
borderRadius: BorderRadius.lg     // 16px - Small cards
borderRadius: BorderRadius.full   // 9999px - Pills/circles
```

---

## ✨ Shadow Effects

Soft shadows with color tints:

```typescript
import { ModernShadows } from '@/constants/designTokens';

// Soft pink-tinted shadow
...ModernShadows.soft

// Glowing effect (for hero cards)
...ModernShadows.glow

// Floating effect (for modals)
...ModernShadows.floating
```

---

## 🎨 Complete Screen Example

### Modern Dashboard

```typescript
import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BalanceCard from '@/components/BalanceCard';
import GlassCard from '@/components/ui/GlassCard';
import ModernButton from '@/components/ui/ModernButton';
import { Colors } from '@/constants/theme';
import { Spacing, Typography } from '@/constants/designTokens';

export default function Dashboard() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.backgroundSecondary }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Balance Card */}
        <BalanceCard
          balance={481296.89}
          currency="$"
          title="AVAILABLE BALANCE"
          showEyeIcon={true}
        />

        {/* Quick Actions */}
        <View style={{
          flexDirection: 'row',
          paddingHorizontal: Spacing.md,
          gap: Spacing.sm,
          marginBottom: Spacing.lg,
        }}>
          <View style={{ flex: 1 }}>
            <ModernButton
              title="Send"
              variant="glass"
              icon={<Text style={{ fontSize: 20 }}>↗️</Text>}
              onPress={() => {}}
            />
          </View>

          <View style={{ flex: 1 }}>
            <ModernButton
              title="Receive"
              variant="glass"
              icon={<Text style={{ fontSize: 20 }}>↙️</Text>}
              onPress={() => {}}
            />
          </View>

          <View style={{ flex: 1 }}>
            <ModernButton
              title="Buy"
              variant="gradient"
              icon={<Text style={{ fontSize: 20, color: 'white' }}>+</Text>}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Assets Section */}
        <View style={{ padding: Spacing.md }}>
          <Text style={{
            fontSize: Typography.fontSize.lg,
            fontWeight: Typography.fontWeight.bold,
            marginBottom: Spacing.md,
          }}>
            My Assets
          </Text>

          <GlassCard variant="pink" padding="lg">
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
              <Text style={{
                fontSize: Typography.fontSize.base,
                fontWeight: Typography.fontWeight.semibold,
              }}>
                💎 Savings Account
              </Text>
              <Text style={{
                fontSize: Typography.fontSize.lg,
                fontWeight: Typography.fontWeight.bold,
              }}>
                $1,623,182.90
              </Text>
            </View>

            <Text style={{
              fontSize: Typography.fontSize.sm,
              color: Colors.light.textSecondary,
            }}>
              Main account • Bank
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

---

## 🎯 Best Practices

### DO ✅
- **Use gradients** for hero/important cards
- **Use glass effects** for secondary cards and overlays
- **Use bold typography** (700-900 weight) for numbers and titles
- **Add generous spacing** (16-24px between elements)
- **Round corners heavily** (20-28px border radius)
- **Layer cards** with soft shadows
- **Keep backgrounds simple** (solid or subtle gradients)

### DON'T ❌
- Don't use too many gradients on one screen
- Don't make text too small (minimum 13px)
- Don't use sharp corners (< 12px radius)
- Don't overcrowd the screen
- Don't use harsh shadows
- Don't mix too many glass effects

---

## 📐 Layout Tips

### Spacing
```typescript
// Between sections
marginBottom: Spacing.xl    // 32px

// Between cards
marginBottom: Spacing.md    // 16px

// Card padding
padding: Spacing.lg         // 24px

// Button padding
padding: Spacing.md         // 16px
```

### Card Hierarchy
1. **Hero Card** - Gradient background, largest
2. **Primary Cards** - Glass effect, prominent
3. **Secondary Cards** - Subtle glass, smaller

---

## 🌈 Color Usage

```typescript
// Hero backgrounds
LinearGradient colors={['#F5569B', '#B855D4']}

// Glass tints
variant="pink"  // For budget/money features
variant="blue"  // For security/bank features
variant="light" // For general content

// Text on gradients
color: '#fff'  // Always white

// Text on glass
color: Colors.light.text  // Use theme colors
```

---

**Your modern, sleek UI system is ready!** 🎨✨

Use these components and patterns to create beautiful, contemporary interfaces that match the best fintech apps.

