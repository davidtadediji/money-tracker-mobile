/**
 * Design Tokens
 * 
 * Standardized design values for consistent UI across the app
 */

// ============================================================================
// Spacing System (8px base unit)
// ============================================================================

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// ============================================================================
// Border Radius (More rounded for modern look)
// ============================================================================

export const BorderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
  full: 9999,
};

// ============================================================================
// Typography Scale (Bolder, more modern)
// ============================================================================

export const Typography = {
  // Font Sizes
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    xxl: 28,
    xxxl: 34,
    display: 42,
    hero: 56,
    mega: 72,
  },
  
  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.1,
    snug: 1.3,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Letter Spacing
  letterSpacing: {
    tighter: -1,
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },
};

// ============================================================================
// Shadows
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
};

// ============================================================================
// Common Styles
// ============================================================================

export const CommonStyles = {
  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  
  // Buttons
  buttonPrimary: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  buttonSecondary: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  
  // Inputs
  input: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: Typography.fontSize.base,
  },
  
  // Container
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  
  // Section
  section: {
    marginBottom: Spacing.lg,
  },
};

// ============================================================================
// Animation Durations
// ============================================================================

export const Animation = {
  duration: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
};

// ============================================================================
// Breakpoints (for responsive design)
// ============================================================================

export const Breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
};

// ============================================================================
// Glassmorphism Effects (Modern UI)
// ============================================================================

export const Glassmorphism = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  
  dark: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  coloredPink: {
    backgroundColor: 'rgba(245, 86, 155, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(245, 86, 155, 0.3)',
  },
  
  coloredBlue: {
    backgroundColor: 'rgba(19, 85, 178, 0.15)',
    backdropFilter: 'blur(20px)',
    borderWidth: 1,
    borderColor: 'rgba(19, 85, 178, 0.3)',
  },
};

// ============================================================================
// Gradients (Modern UI)
// ============================================================================

export const Gradients = {
  pinkPurple: {
    colors: ['#F5569B', '#B855D4'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  pinkBlue: {
    colors: ['#F5569B', '#1355B2'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  bluePurple: {
    colors: ['#1355B2', '#6B46C1'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  lightPink: {
    colors: ['#FFE5F5', '#FFCBEB'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  darkGradient: {
    colors: ['#1F2937', '#111827'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  success: {
    colors: ['#10B981', '#059669'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
};

// ============================================================================
// Modern Shadows (Softer, more subtle)
// ============================================================================

export const ModernShadows = {
  soft: {
    shadowColor: '#F5569B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  
  glow: {
    shadowColor: '#F5569B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  
  floating: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
};

// ============================================================================
// Z-Index Layers
// ============================================================================

export const ZIndex = {
  base: 0,
  dropdown: 10,
  sticky: 20,
  modal: 30,
  popover: 40,
  toast: 50,
};

