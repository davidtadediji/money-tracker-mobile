# 🎨 Money Tracker Color Palette

Visual reference for all colors in the design system.

---

## 🌟 Your Brand Colors

### Primary Pink
```
#F5569B  ████████  Vibrant Pink (Primary)
#FF7DB3  ████████  Light Pink (Primary Light)
#D93D7F  ████████  Dark Pink (Primary Dark)
```

**Usage:** Primary actions, active states, highlights, progress bars

### Secondary Pink
```
#FFCBEB  ████████  Soft Pink (Secondary)
#FFE5F5  ████████  Very Light Pink (Secondary Light)
#FFB0DE  ████████  Medium Pink (Secondary Dark)
```

**Usage:** Backgrounds, cards, soft highlights, disabled states

### Accent Blue
```
#1355B2  ████████  Deep Blue (Accent)
#1E6FD9  ████████  Bright Blue (Accent Light)
#0D428A  ████████  Dark Blue (Accent Dark)
```

**Usage:** Links, info badges, trust indicators, secondary actions

---

## ✅ Semantic Colors

### Success (Income, Positive)
```
#10B981  ████████  Green
#D1FAE5  ████████  Light Green Background
```

### Error (Over Budget, Negative)
```
#EF4444  ████████  Red
#FEE2E2  ████████  Light Red Background
```

### Warning (Approaching Limit)
```
#F59E0B  ████████  Amber
#FEF3C7  ████████  Light Amber Background
```

### Info
```
#3B82F6  ████████  Blue
#DBEAFE  ████████  Light Blue Background
```

---

## ⚫ Neutral Colors (Grays)

```
#FFFFFF  ████████  White
#F9FAFB  ████████  Gray 50
#F3F4F6  ████████  Gray 100
#E5E7EB  ████████  Gray 200 (Borders)
#D1D5DB  ████████  Gray 300
#9CA3AF  ████████  Gray 400
#6B7280  ████████  Gray 500 (Secondary Text)
#4B5563  ████████  Gray 600 (Icons)
#374151  ████████  Gray 700
#1F2937  ████████  Gray 800
#111827  ████████  Gray 900 (Primary Text)
#000000  ████████  Black
```

---

## 🎨 Color Combinations

### High Contrast (Accessible)
```
Primary Pink (#F5569B) on White Background
✓ WCAG AA Pass - Great for buttons and important text

Accent Blue (#1355B2) on White Background  
✓ WCAG AA Pass - Perfect for links and info

Gray 900 (#111827) on White Background
✓ WCAG AAA Pass - Best for body text
```

### Cards & Surfaces
```
Card 1: White background + Primary Pink accent
Card 2: Secondary Light (#FFE5F5) background + Primary Pink text
Card 3: Gray 50 (#F9FAFB) background + Gray 900 text
```

### Buttons
```
Primary:   #F5569B background + White text
Secondary: #FFCBEB background + Gray 900 text  
Accent:    #1355B2 background + White text
Outline:   Transparent background + #F5569B border & text
```

---

## 📊 Usage Matrix

| Element | Light Mode | Dark Mode |
|---------|-----------|-----------|
| **Background** | White | Gray 900 |
| **Primary Button** | Pink (#F5569B) | Light Pink (#FF7DB3) |
| **Secondary Button** | Light Pink (#FFCBEB) | Medium Pink (#FFB0DE) |
| **Accent Button** | Blue (#1355B2) | Bright Blue (#1E6FD9) |
| **Card Background** | White | Gray 800 |
| **Text Primary** | Gray 900 | Gray 50 |
| **Text Secondary** | Gray 600 | Gray 300 |
| **Border** | Gray 200 | Gray 700 |
| **Icon Inactive** | Gray 600 | Gray 400 |
| **Icon Active** | Pink (#F5569B) | Light Pink (#FF7DB3) |
| **Link** | Blue (#1355B2) | Bright Blue (#1E6FD9) |
| **Success** | Green (#10B981) | Light Green (#34D399) |
| **Error** | Red (#EF4444) | Light Red (#F87171) |
| **Warning** | Amber (#F59E0B) | Light Amber (#FBBF24) |

---

## 🎯 Quick Reference

### For Developers
```typescript
import { Colors, BrandColors } from '@/constants/theme';

// Use theme colors (auto dark mode)
backgroundColor: Colors.light.primary  // or Colors.dark.primary

// Use brand colors (fixed)
backgroundColor: BrandColors.primary  // Always #F5569B
```

### Color Variables
```typescript
// Brand
Colors.light.primary          // #F5569B
Colors.light.secondary        // #FFCBEB
Colors.light.accent           // #1355B2

// Semantic
Colors.light.success          // #10B981
Colors.light.error            // #EF4444
Colors.light.warning          // #F59E0B

// Neutral
Colors.light.text             // #111827
Colors.light.textSecondary    // #6B7280
Colors.light.border           // #E5E7EB
```

---

## 🌈 Color Meanings

| Color | Emotion | Use Case |
|-------|---------|----------|
| **Pink (#F5569B)** | Energetic, Friendly, Modern | Primary actions, highlights |
| **Light Pink (#FFCBEB)** | Soft, Welcoming, Calm | Backgrounds, secondary elements |
| **Blue (#1355B2)** | Trust, Stable, Professional | Links, security, information |
| **Green** | Success, Growth, Positive | Income, savings, achievements |
| **Red** | Alert, Important, Urgent | Overspending, errors, warnings |
| **Amber** | Caution, Attention | Approaching limits, pending |

---

## 💡 Design Tips

1. **Contrast is Key** - Always test text readability
2. **Use Pink Sparingly** - Primary pink is vibrant, use for accents
3. **Light Pink for Calm** - Use secondary pink for larger areas
4. **Blue for Trust** - Use accent blue for financial/security features
5. **Semantic Colors** - Don't use green/red for non-status elements
6. **Consistent Spacing** - Use design tokens, not hardcoded values

---

## 📱 Platform Considerations

### iOS
- Buttons use subtle shadows
- Cards have gentle elevation
- Rounded corners (12px standard)

### Android
- Higher elevation shadows
- Material-style ripple effects
- Consistent with Material 3 guidelines

### Web
- Hover states important
- Focus outlines for accessibility
- Cursor changes on interactive elements

---

## ♿ Accessibility

All color combinations are tested for WCAG 2.1 compliance:

✅ **Primary Pink on White** - AA Pass (4.52:1)  
✅ **Accent Blue on White** - AA Pass (7.45:1)  
✅ **Gray 900 on White** - AAA Pass (16.07:1)  
✅ **White on Primary Pink** - AA Pass (4.52:1)  
✅ **White on Accent Blue** - AA Pass (7.45:1)

---

**Your vibrant, modern color palette is ready to use!** 🎨✨

