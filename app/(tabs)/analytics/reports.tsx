import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';

type ReportType = 'income_expense' | 'category' | 'trend' | 'budget';
type GroupingType = 'day' | 'week' | 'month' | 'year' | 'category';

export default function Reports() {
  const router = useRouter();
  const {
    savedReports,
    loading,
    createReport,
    deleteReportById,
    executeReportById,
    refreshSavedReports,
  } = useAnalytics();

  // Create Report Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [reportType, setReportType] = useState<ReportType>('income_expense');
  const [startDate, setStartDate] = useState(getDefaultStartDate());
  const [endDate, setEndDate] = useState(getTodayDate());
  const [grouping, setGrouping] = useState<GroupingType>('day');
  const [isCreating, setIsCreating] = useState(false);

  // View Report Results State
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [currentReportResults, setCurrentReportResults] = useState<any>(null);
  const [currentReportName, setCurrentReportName] = useState('');

  function getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  function getDefaultStartDate(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  }

  const handleCreateReport = async () => {
    if (!reportName.trim()) {
      Alert.alert('Error', 'Please enter a report name');
      return;
    }

    if (!startDate || !endDate) {
      Alert.alert('Error', 'Please select start and end dates');
      return;
    }

    setIsCreating(true);

    try {
      const { success, error } = await createReport({
        name: reportName.trim(),
        description: reportDescription.trim() || undefined,
        report_type: reportType,
        date_range: {
          start: startDate,
          end: endDate,
        },
        grouping: reportType === 'trend' ? grouping : undefined,
      });

      if (success) {
        Alert.alert('Success', 'Report created successfully');
        setShowCreateModal(false);
        resetForm();
        await refreshSavedReports();
      } else {
        Alert.alert('Error', error || 'Failed to create report');
      }
    } catch (err) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteReport = (reportId: string, reportName: string) => {
    Alert.alert('Delete Report', `Are you sure you want to delete "${reportName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { success, error } = await deleteReportById(reportId);
          if (success) {
            Alert.alert('Success', 'Report deleted successfully');
            await refreshSavedReports();
          } else {
            Alert.alert('Error', error || 'Failed to delete report');
          }
        },
      },
    ]);
  };

  const handleExecuteReport = async (reportId: string, reportName: string) => {
    const { success, data, error } = await executeReportById(reportId);
    if (success) {
      setCurrentReportResults(data);
      setCurrentReportName(reportName);
      setShowResultsModal(true);
    } else {
      Alert.alert('Error', error || 'Failed to execute report');
    }
  };

  const resetForm = () => {
    setReportName('');
    setReportDescription('');
    setReportType('income_expense');
    setStartDate(getDefaultStartDate());
    setEndDate(getTodayDate());
    setGrouping('day');
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatCurrency = (amount: number): string => {
    return `$${Math.abs(amount).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const renderReportResults = () => {
    if (!currentReportResults) return null;

    // Income vs Expense Report
    if (currentReportResults.income !== undefined) {
      return (
        <View style={styles.resultsContent}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Income:</Text>
            <Text style={[styles.resultValue, styles.incomeText]}>
              {formatCurrency(currentReportResults.income)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Total Expenses:</Text>
            <Text style={[styles.resultValue, styles.expenseText]}>
              {formatCurrency(currentReportResults.expense)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Net Balance:</Text>
            <Text
              style={[
                styles.resultValue,
                currentReportResults.net >= 0 ? styles.incomeText : styles.expenseText,
              ]}
            >
              {currentReportResults.net >= 0 ? '+' : ''}
              {formatCurrency(currentReportResults.net)}
            </Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Income Transactions:</Text>
            <Text style={styles.resultValue}>{currentReportResults.incomeCount}</Text>
          </View>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>Expense Transactions:</Text>
            <Text style={styles.resultValue}>{currentReportResults.expenseCount}</Text>
          </View>
        </View>
      );
    }

    // Category Analysis Report
    if (Array.isArray(currentReportResults) && currentReportResults[0]?.category) {
      return (
        <ScrollView style={styles.resultsScrollView}>
          {currentReportResults.map((cat: any, index: number) => (
            <View key={index} style={styles.categoryResultCard}>
              <View style={styles.categoryResultHeader}>
                <Text style={styles.categoryResultName}>{cat.category}</Text>
                <Text style={styles.categoryResultPercent}>{cat.percentage.toFixed(1)}%</Text>
              </View>
              <Text style={styles.categoryResultAmount}>{formatCurrency(cat.totalAmount)}</Text>
              <Text style={styles.categoryResultCount}>
                {cat.transactionCount} transaction{cat.transactionCount !== 1 ? 's' : ''}
              </Text>
            </View>
          ))}
        </ScrollView>
      );
    }

    // Time Trend Report
    if (Array.isArray(currentReportResults) && currentReportResults[0]?.date) {
      return (
        <ScrollView style={styles.resultsScrollView}>
          {currentReportResults.map((trend: any, index: number) => (
            <View key={index} style={styles.trendResultCard}>
              <Text style={styles.trendResultDate}>{formatDate(trend.date)}</Text>
              <View style={styles.trendResultAmounts}>
                <View style={styles.trendResultItem}>
                  <Text style={styles.trendResultLabel}>Income:</Text>
                  <Text style={[styles.trendResultValue, styles.incomeText]}>
                    {formatCurrency(trend.income)}
                  </Text>
                </View>
                <View style={styles.trendResultItem}>
                  <Text style={styles.trendResultLabel}>Expense:</Text>
                  <Text style={[styles.trendResultValue, styles.expenseText]}>
                    {formatCurrency(trend.expense)}
                  </Text>
                </View>
                <View style={styles.trendResultItem}>
                  <Text style={styles.trendResultLabel}>Net:</Text>
                  <Text
                    style={[
                      styles.trendResultValue,
                      trend.net >= 0 ? styles.incomeText : styles.expenseText,
                    ]}
                  >
                    {trend.net >= 0 ? '+' : ''}
                    {formatCurrency(trend.net)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      );
    }

    // Budget Performance Report
    if (Array.isArray(currentReportResults) && currentReportResults[0]?.budgetId) {
      return (
        <ScrollView style={styles.resultsScrollView}>
          {currentReportResults.map((budget: any, index: number) => (
            <View key={index} style={styles.budgetResultCard}>
              <Text style={styles.budgetResultCategory}>{budget.category}</Text>
              <View style={styles.budgetResultAmounts}>
                <Text style={styles.budgetResultSpent}>
                  Spent: {formatCurrency(budget.spentAmount)}
                </Text>
                <Text style={styles.budgetResultLimit}>
                  / {formatCurrency(budget.budgetAmount)}
                </Text>
              </View>
              <View style={styles.budgetResultProgressTrack}>
                <View
                  style={[
                    styles.budgetResultProgressFill,
                    {
                      width: `${Math.min(budget.percentageUsed, 100)}%`,
                      backgroundColor:
                        budget.status === 'over'
                          ? Colors.light.error
                          : budget.status === 'near'
                          ? '#FFA500'
                          : Colors.light.success,
                    },
                  ]}
                />
              </View>
              <Text style={styles.budgetResultPercent}>
                {budget.percentageUsed.toFixed(1)}% used • {budget.status.toUpperCase()}
              </Text>
            </View>
          ))}
        </ScrollView>
      );
    }

    return <Text style={styles.noResultsText}>No data available</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Custom Reports</Text>
          <Text style={styles.subtitle}>Create and manage your custom analytics reports</Text>
        </View>

        {/* Create Report Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create New Report</Text>
        </TouchableOpacity>

        {/* Saved Reports */}
        <Text style={styles.sectionTitle}>Saved Reports ({savedReports.length})</Text>

        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.primary} style={{ marginTop: Spacing.xl }} />
        ) : savedReports.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📄</Text>
            <Text style={styles.emptyTitle}>No Saved Reports</Text>
            <Text style={styles.emptySubtitle}>
              Create your first custom report to analyze your financial data
            </Text>
          </View>
        ) : (
          <View style={styles.reportsList}>
            {savedReports.map((report) => (
              <View key={report.id} style={styles.reportCard}>
                <View style={styles.reportHeader}>
                  <View style={styles.reportTitleRow}>
                    <Text style={styles.reportName}>{report.name}</Text>
                    <View style={styles.reportTypeBadge}>
                      <Text style={styles.reportTypeBadgeText}>
                        {report.report_type.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>
                  {report.description && (
                    <Text style={styles.reportDescription}>{report.description}</Text>
                  )}
                </View>

                <View style={styles.reportMeta}>
                  <Text style={styles.reportMetaText}>
                    📅 {formatDate(report.date_range.start)} - {formatDate(report.date_range.end)}
                  </Text>
                  {report.grouping && (
                    <Text style={styles.reportMetaText}>📊 Grouped by: {report.grouping}</Text>
                  )}
                  <Text style={styles.reportMetaText}>
                    🕐 Created: {formatDate(report.created_at)}
                  </Text>
                </View>

                <View style={styles.reportActions}>
                  <TouchableOpacity
                    style={styles.runButton}
                    onPress={() => handleExecuteReport(report.id, report.name)}
                  >
                    <Text style={styles.runButtonText}>▶ Run Report</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteReport(report.id, report.name)}
                  >
                    <Text style={styles.deleteButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Report Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Create Custom Report</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Report Name */}
              <Text style={styles.label}>Report Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Monthly Expense Analysis"
                value={reportName}
                onChangeText={setReportName}
                placeholderTextColor={Colors.light.textSecondary}
              />

              {/* Description */}
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="What does this report analyze?"
                value={reportDescription}
                onChangeText={setReportDescription}
                multiline
                placeholderTextColor={Colors.light.textSecondary}
              />

              {/* Report Type */}
              <Text style={styles.label}>Report Type *</Text>
              <View style={styles.chipContainer}>
                {(['income_expense', 'category', 'trend', 'budget'] as ReportType[]).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.chip, reportType === type && styles.chipActive]}
                    onPress={() => setReportType(type)}
                  >
                    <Text style={[styles.chipText, reportType === type && styles.chipTextActive]}>
                      {type.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Date Range */}
              <Text style={styles.label}>Date Range *</Text>
              <View style={styles.dateRow}>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="Start (YYYY-MM-DD)"
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholderTextColor={Colors.light.textSecondary}
                />
                <Text style={styles.dateSeparator}>to</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="End (YYYY-MM-DD)"
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholderTextColor={Colors.light.textSecondary}
                />
              </View>

              {/* Grouping (only for trend reports) */}
              {reportType === 'trend' && (
                <>
                  <Text style={styles.label}>Grouping *</Text>
                  <View style={styles.chipContainer}>
                    {(['day', 'week', 'month', 'year'] as GroupingType[]).map((group) => (
                      <TouchableOpacity
                        key={group}
                        style={[styles.chip, grouping === group && styles.chipActive]}
                        onPress={() => setGrouping(group)}
                      >
                        <Text style={[styles.chipText, grouping === group && styles.chipTextActive]}>
                          {group}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Create Button */}
              <TouchableOpacity
                style={[styles.modalCreateButton, isCreating && styles.modalCreateButtonDisabled]}
                onPress={handleCreateReport}
                disabled={isCreating}
              >
                {isCreating ? (
                  <ActivityIndicator color={Colors.light.onPrimary} />
                ) : (
                  <Text style={styles.modalCreateButtonText}>Create Report</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Report Results Modal */}
      <Modal
        visible={showResultsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentReportName}</Text>
              <TouchableOpacity onPress={() => setShowResultsModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {renderReportResults()}

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowResultsModal(false)}
            >
              <Text style={styles.modalCancelButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingBottom: Spacing.xxl,
  },

  // Header
  header: {
    marginBottom: Spacing.lg,
  },
  backButton: {
    marginBottom: Spacing.sm,
  },
  backText: {
    color: Colors.light.primary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },

  // Create Button
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  createButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Section Title
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.md,
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    padding: Spacing.xl,
    marginTop: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },

  // Reports List
  reportsList: {
    gap: Spacing.sm,
  },
  reportCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  reportHeader: {
    marginBottom: Spacing.sm,
  },
  reportTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  reportName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  reportTypeBadge: {
    backgroundColor: Colors.light.secondaryLight,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  reportTypeBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.text,
    textTransform: 'capitalize',
  },
  reportDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
  },
  reportMeta: {
    marginBottom: Spacing.sm,
  },
  reportMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  reportActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  runButton: {
    flex: 1,
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  runButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.sm,
  },
  deleteButton: {
    backgroundColor: Colors.light.error,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    fontSize: 18,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.light.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    maxHeight: '90%',
    padding: Spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  modalClose: {
    fontSize: 24,
    color: Colors.light.textSecondary,
    paddingHorizontal: Spacing.sm,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  chipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  chipText: {
    color: Colors.light.textSecondary,
    fontWeight: Typography.fontWeight.medium,
    fontSize: Typography.fontSize.sm,
    textTransform: 'capitalize',
  },
  chipTextActive: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateInput: {
    flex: 1,
  },
  dateSeparator: {
    color: Colors.light.textSecondary,
    fontSize: Typography.fontSize.sm,
  },
  modalCreateButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  modalCreateButtonDisabled: {
    opacity: 0.6,
  },
  modalCreateButtonText: {
    color: Colors.light.onPrimary,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },
  modalCancelButton: {
    backgroundColor: Colors.light.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.light.border,
    marginTop: Spacing.sm,
  },
  modalCancelButtonText: {
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.semibold,
    fontSize: Typography.fontSize.base,
  },

  // Report Results
  resultsContent: {
    padding: Spacing.md,
  },
  resultsScrollView: {
    maxHeight: 400,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  resultLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.text,
  },
  resultValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  incomeText: {
    color: Colors.light.success,
  },
  expenseText: {
    color: Colors.light.error,
  },
  categoryResultCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  categoryResultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  categoryResultName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
  },
  categoryResultPercent: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.accent,
    fontWeight: Typography.fontWeight.bold,
  },
  categoryResultAmount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
  },
  categoryResultCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  trendResultCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trendResultDate: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  trendResultAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  trendResultItem: {
    flex: 1,
  },
  trendResultLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    marginBottom: 2,
  },
  trendResultValue: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  budgetResultCard: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  budgetResultCategory: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  budgetResultAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  budgetResultSpent: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  budgetResultLimit: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
  },
  budgetResultProgressTrack: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  budgetResultProgressFill: {
    height: 8,
  },
  budgetResultPercent: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  noResultsText: {
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    padding: Spacing.xl,
  },
});
