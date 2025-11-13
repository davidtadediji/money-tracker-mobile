/**
 * Category Management System
 * Predefined expense categories with icons
 */

export interface Category {
  id: string;
  name: string;
  icon: string; // Emoji
  color: string; // Optional accent color for future use
}

/**
 * Predefined expense categories
 * These are the default categories available to all users
 */
export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍔',
    color: '#FF6B6B',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#4ECDC4',
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: '🚗',
    color: '#95E1D3',
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#F38181',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#AA96DA',
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: '📄',
    color: '#FCBAD3',
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '💪',
    color: '#A8E6CF',
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#FFD3B6',
  },
  {
    id: 'travel',
    name: 'Travel',
    icon: '✈️',
    color: '#FFAAA5',
  },
  {
    id: 'housing',
    name: 'Housing',
    icon: '🏠',
    color: '#FF8B94',
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: '🛡️',
    color: '#A8D8EA',
  },
  {
    id: 'personal',
    name: 'Personal Care',
    icon: '💅',
    color: '#FFCCF9',
  },
  {
    id: 'gifts',
    name: 'Gifts & Donations',
    icon: '🎁',
    color: '#FEC8D8',
  },
  {
    id: 'pets',
    name: 'Pets',
    icon: '🐾',
    color: '#FFDFD3',
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    icon: '📱',
    color: '#E0BBE4',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    color: '#957DAD',
  },
  {
    id: 'other',
    name: 'Other',
    icon: '💰',
    color: '#D4A5A5',
  },
];

/**
 * Custom category identifier
 * Used to indicate user wants to enter a custom category
 */
export const CUSTOM_CATEGORY_ID = 'custom';

/**
 * Custom category option
 * Shows in the category picker to allow custom input
 */
export const CUSTOM_CATEGORY: Category = {
  id: CUSTOM_CATEGORY_ID,
  name: 'Custom Category',
  icon: '✏️',
  color: '#999999',
};

/**
 * Get category by ID
 * @param categoryId - Category ID to find
 * @returns Category object or undefined
 */
export function getCategoryById(categoryId: string): Category | undefined {
  return EXPENSE_CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Get category by name (case-insensitive)
 * @param categoryName - Category name to find
 * @returns Category object or undefined
 */
export function getCategoryByName(categoryName: string): Category | undefined {
  return EXPENSE_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
  );
}

/**
 * Check if category name matches a predefined category
 * @param categoryName - Category name to check
 * @returns true if it matches a predefined category
 */
export function isPredefinedCategory(categoryName: string): boolean {
  return getCategoryByName(categoryName) !== undefined;
}

/**
 * Get category icon for a given category name
 * Returns the predefined icon if it exists, otherwise returns a default icon
 * @param categoryName - Category name
 * @returns Category icon emoji
 */
export function getCategoryIcon(categoryName: string): string {
  const category = getCategoryByName(categoryName);
  return category ? category.icon : '💰'; // Default icon
}

/**
 * Get category color for a given category name
 * Returns the predefined color if it exists, otherwise returns a default color
 * @param categoryName - Category name
 * @returns Category color hex code
 */
export function getCategoryColor(categoryName: string): string {
  const category = getCategoryByName(categoryName);
  return category ? category.color : '#999999'; // Default color
}

/**
 * Get all categories including the custom option
 * @returns Array of all categories plus custom option
 */
export function getAllCategoriesWithCustom(): Category[] {
  return [...EXPENSE_CATEGORIES, CUSTOM_CATEGORY];
}

/**
 * Format category name for display
 * Capitalizes first letter if needed
 * @param categoryName - Category name
 * @returns Formatted category name
 */
export function formatCategoryName(categoryName: string): string {
  if (!categoryName) return '';
  return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
}

