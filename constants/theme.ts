/**
 * Money Tracker Design System
 * 
 * Brand Colors: Pink (#F5569B), Light Pink (#FFCBEB), Blue (#1355B2)
 * A modern, vibrant color palette for financial tracking
 */

import { Platform } from 'react-native';

// ============================================================================
// Brand Colors
// ============================================================================

export const BrandColors = {
  primary: '#F5569B',      // Vibrant Pink - Primary actions, highlights
  secondary: '#FFCBEB',    // Soft Pink - Secondary elements, backgrounds
  accent: '#1355B2',       // Deep Blue - Accents, trust, stability
  
  // Primary variations
  primaryLight: '#FF7DB3',
  primaryDark: '#D93D7F',
  
  // Secondary variations
  secondaryLight: '#FFE5F5',
  secondaryDark: '#FFB0DE',
  
  // Accent variations
  accentLight: '#1E6FD9',
  accentDark: '#0D428A',
};

// ============================================================================
// Semantic Colors
// ============================================================================

export const SemanticColors = {
  success: '#10B981',      // Green - Positive actions, income
  successLight: '#D1FAE5',
  
  error: '#EF4444',        // Red - Errors, overspending
  errorLight: '#FEE2E2',
  
  warning: '#F59E0B',      // Amber - Warnings, approaching limits
  warningLight: '#FEF3C7',
  
  info: '#3B82F6',         // Blue - Information
  infoLight: '#DBEAFE',
};

// ============================================================================
// Neutral Colors
// ============================================================================

export const NeutralColors = {
  white: '#FFFFFF',
  black: '#000000',
  
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',
};

// ============================================================================
// Theme Colors (Light & Dark Mode)
// ============================================================================

export const Colors = {
  light: {
    // Backgrounds
    background: NeutralColors.white,
    backgroundSecondary: NeutralColors.gray50,
    backgroundTertiary: BrandColors.secondaryLight,
    
    // Surfaces
    surface: NeutralColors.white,
    surfaceElevated: NeutralColors.white,
    
    // Text
    text: NeutralColors.gray900,
    textSecondary: NeutralColors.gray600,
    textTertiary: NeutralColors.gray500,
    textInverse: NeutralColors.white,
    
    // Primary Brand
    primary: BrandColors.primary,
    primaryLight: BrandColors.primaryLight,
    primaryDark: BrandColors.primaryDark,
    onPrimary: NeutralColors.white,
    
    // Secondary Brand
    secondary: BrandColors.secondary,
    secondaryLight: BrandColors.secondaryLight,
    secondaryDark: BrandColors.secondaryDark,
    onSecondary: NeutralColors.gray900,
    
    // Accent
    accent: BrandColors.accent,
    accentLight: BrandColors.accentLight,
    accentDark: BrandColors.accentDark,
    onAccent: NeutralColors.white,
    
    // Semantic
    success: SemanticColors.success,
    successBackground: SemanticColors.successLight,
    error: SemanticColors.error,
    errorBackground: SemanticColors.errorLight,
    warning: SemanticColors.warning,
    warningBackground: SemanticColors.warningLight,
    info: SemanticColors.info,
    infoBackground: SemanticColors.infoLight,
    
    // Borders
    border: NeutralColors.gray200,
    borderLight: NeutralColors.gray100,
    borderDark: NeutralColors.gray300,
    
    // Icons & Tabs
    icon: NeutralColors.gray600,
    iconActive: BrandColors.primary,
    tabIconDefault: NeutralColors.gray500,
    tabIconSelected: BrandColors.primary,
    
    // Interactive
    tint: BrandColors.primary,
    link: BrandColors.accent,
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.25)',
    
    // Shadows
    shadow: NeutralColors.gray900,
  },
  
  dark: {
    // Backgrounds
    background: NeutralColors.gray900,
    backgroundSecondary: NeutralColors.gray800,
    backgroundTertiary: '#2D1B29', // Dark pink tint
    
    // Surfaces
    surface: NeutralColors.gray800,
    surfaceElevated: NeutralColors.gray700,
    
    // Text
    text: NeutralColors.gray50,
    textSecondary: NeutralColors.gray300,
    textTertiary: NeutralColors.gray400,
    textInverse: NeutralColors.gray900,
    
    // Primary Brand
    primary: BrandColors.primaryLight,
    primaryLight: '#FFB3D5',
    primaryDark: BrandColors.primary,
    onPrimary: NeutralColors.gray900,
    
    // Secondary Brand
    secondary: BrandColors.secondaryDark,
    secondaryLight: BrandColors.secondary,
    secondaryDark: '#FF99D1',
    onSecondary: NeutralColors.gray900,
    
    // Accent
    accent: BrandColors.accentLight,
    accentLight: '#4A8FE7',
    accentDark: BrandColors.accent,
    onAccent: NeutralColors.white,
    
    // Semantic
    success: '#34D399',
    successBackground: '#064E3B',
    error: '#F87171',
    errorBackground: '#7F1D1D',
    warning: '#FBBF24',
    warningBackground: '#78350F',
    info: '#60A5FA',
    infoBackground: '#1E3A8A',
    
    // Borders
    border: NeutralColors.gray700,
    borderLight: NeutralColors.gray800,
    borderDark: NeutralColors.gray600,
    
    // Icons & Tabs
    icon: NeutralColors.gray400,
    iconActive: BrandColors.primaryLight,
    tabIconDefault: NeutralColors.gray500,
    tabIconSelected: BrandColors.primaryLight,
    
    // Interactive
    tint: BrandColors.primaryLight,
    link: BrandColors.accentLight,
    
    // Overlays
    overlay: 'rgba(0, 0, 0, 0.75)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',
    
    // Shadows
    shadow: NeutralColors.black,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
