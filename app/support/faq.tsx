/**
 * FAQ Screen
 * Browse and search frequently asked questions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { useSupport } from '@/contexts/SupportContext';
import type { FAQ } from '@/services/supportService';

export default function FAQScreen() {
  const {
    faqs,
    faqCategories,
    isLoadingFAQs,
    loadFAQs,
    searchFAQs,
    markFAQHelpful,
  } = useSupport();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQs, setExpandedFAQs] = useState<Set<string>>(new Set());
  const [isSearching, setIsSearching] = useState(false);

  // Handle search
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const results = await searchFAQs(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, searchFAQs]);

  // Load FAQs by category
  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    loadFAQs(category || undefined);
    setSearchQuery('');
  };

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQs(prev => {
      const next = new Set(prev);
      if (next.has(faqId)) {
        next.delete(faqId);
      } else {
        next.add(faqId);
      }
      return next;
    });
  };

  const handleMarkHelpful = async (faqId: string, isHelpful: boolean) => {
    await markFAQHelpful(faqId, isHelpful);
  };

  const displayFAQs = searchQuery.trim().length >= 2 ? searchResults : faqs;

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search FAQs..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching && <ActivityIndicator size="small" color={Colors.light.primary} />}
        </View>

        {/* Category Filter */}
        {!searchQuery && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === null && styles.categoryChipActive,
              ]}
              onPress={() => handleCategorySelect(null)}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === null && styles.categoryChipTextActive,
                ]}
              >
                All
              </Text>
            </TouchableOpacity>
            
            {faqCategories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Loading State */}
        {isLoadingFAQs && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
          </View>
        )}

        {/* FAQs List */}
        {!isLoadingFAQs && displayFAQs.length > 0 && (
          <View style={styles.faqsContainer}>
            {searchQuery && (
              <Text style={styles.resultsText}>
                Found {displayFAQs.length} result{displayFAQs.length !== 1 ? 's' : ''}
              </Text>
            )}

            {displayFAQs.map((faq) => {
              const isExpanded = expandedFAQs.has(faq.id);
              
              return (
                <View key={faq.id} style={styles.faqCard}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleFAQ(faq.id)}
                  >
                    <View style={styles.faqHeaderLeft}>
                      {faq.is_featured && (
                        <Text style={styles.featuredBadge}>⭐</Text>
                      )}
                      <Text style={styles.faqQuestion}>{faq.question}</Text>
                    </View>
                    <Text style={styles.expandIcon}>
                      {isExpanded ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={styles.faqContent}>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>

                      {/* Category Tag */}
                      <View style={styles.faqMeta}>
                        <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>
                            {faq.category.replace('_', ' ')}
                          </Text>
                        </View>
                      </View>

                      {/* Helpful Buttons */}
                      <View style={styles.helpfulContainer}>
                        <Text style={styles.helpfulText}>Was this helpful?</Text>
                        <View style={styles.helpfulButtons}>
                          <TouchableOpacity
                            style={styles.helpfulButton}
                            onPress={() => handleMarkHelpful(faq.id, true)}
                          >
                            <Text style={styles.helpfulButtonText}>👍 Yes</Text>
                            {faq.helpful_count > 0 && (
                              <Text style={styles.helpfulCount}>
                                {faq.helpful_count}
                              </Text>
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.helpfulButton}
                            onPress={() => handleMarkHelpful(faq.id, false)}
                          >
                            <Text style={styles.helpfulButtonText}>👎 No</Text>
                            {faq.not_helpful_count > 0 && (
                              <Text style={styles.helpfulCount}>
                                {faq.not_helpful_count}
                              </Text>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {/* Empty State */}
        {!isLoadingFAQs && displayFAQs.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No results found' : 'No FAQs available'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery
                ? 'Try different keywords or contact support'
                : 'Check back later for helpful answers'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  categoriesContainer: {
    marginBottom: Spacing.md,
  },
  categoriesContent: {
    paddingRight: Spacing.md,
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginRight: Spacing.xs,
  },
  categoryChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  categoryChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  categoryChipTextActive: {
    color: Colors.light.onPrimary,
  },
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  resultsText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  faqsContainer: {
    gap: Spacing.sm,
  },
  faqCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
  },
  featuredBadge: {
    fontSize: 16,
  },
  faqQuestion: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  expandIcon: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.sm,
  },
  faqContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  faqAnswer: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    lineHeight: 22,
    marginTop: Spacing.sm,
  },
  faqMeta: {
    flexDirection: 'row',
    marginTop: Spacing.md,
  },
  categoryTag: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  helpfulContainer: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  helpfulText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.sm,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  helpfulButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.backgroundSecondary,
    gap: Spacing.xs,
  },
  helpfulButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
  },
  helpfulCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
});

