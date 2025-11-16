/**
 * Support Tickets Screen
 * View and manage support tickets
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { BorderRadius, Spacing, Typography } from '@/constants/designTokens';
import { useSupport } from '@/contexts/SupportContext';
import type { SupportTicket } from '@/services/supportService';

export default function TicketsScreen() {
  const router = useRouter();
  const { tickets, isLoadingTickets, loadTickets } = useSupport();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTickets();
    setRefreshing(false);
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (filter === 'open') {
      return ticket.status === 'open' || ticket.status === 'in_progress';
    }
    if (filter === 'resolved') {
      return ticket.status === 'resolved' || ticket.status === 'closed';
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return Colors.light.primary;
      case 'in_progress':
        return Colors.light.accent;
      case 'resolved':
        return Colors.light.success;
      case 'closed':
        return Colors.light.textSecondary;
      default:
        return Colors.light.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return Colors.light.error;
      case 'high':
        return Colors.light.warning;
      case 'medium':
        return Colors.light.accent;
      case 'low':
        return Colors.light.textSecondary;
      default:
        return Colors.light.textSecondary;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (isLoadingTickets && tickets.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading tickets...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>My Tickets</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/support/contact')}
          >
            <Text style={styles.createButtonText}>+ New</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.filterTab, filter === 'all' && styles.filterTabActive]}
            onPress={() => setFilter('all')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'all' && styles.filterTabTextActive,
              ]}
            >
              All ({tickets.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'open' && styles.filterTabActive]}
            onPress={() => setFilter('open')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'open' && styles.filterTabTextActive,
              ]}
            >
              Open ({tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterTab, filter === 'resolved' && styles.filterTabActive]}
            onPress={() => setFilter('resolved')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'resolved' && styles.filterTabTextActive,
              ]}
            >
              Resolved ({tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        {filteredTickets.length > 0 ? (
          <View style={styles.ticketsContainer}>
            {filteredTickets.map((ticket) => (
              <TouchableOpacity
                key={ticket.id}
                style={styles.ticketCard}
                onPress={() => {
                  // Navigate to ticket details (not implemented yet)
                  // router.push(`/support/tickets/${ticket.id}`);
                }}
              >
                {/* Ticket Header */}
                <View style={styles.ticketHeader}>
                  <View style={styles.ticketHeaderLeft}>
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: getPriorityColor(ticket.priority) },
                      ]}
                    />
                    <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(ticket.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(ticket.status) },
                      ]}
                    >
                      {getStatusLabel(ticket.status)}
                    </Text>
                  </View>
                </View>

                {/* Ticket Description */}
                <Text style={styles.ticketDescription} numberOfLines={2}>
                  {ticket.description}
                </Text>

                {/* Ticket Meta */}
                <View style={styles.ticketMeta}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>
                      {ticket.category.replace('_', ' ')}
                    </Text>
                  </View>
                  <Text style={styles.ticketDate}>{formatDate(ticket.created_at)}</Text>
                </View>

                {/* Admin Response Indicator */}
                {ticket.admin_response && (
                  <View style={styles.responseIndicator}>
                    <Text style={styles.responseText}>💬 Response received</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🎫</Text>
            <Text style={styles.emptyTitle}>
              {filter === 'all'
                ? 'No tickets yet'
                : `No ${filter} tickets`}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'all'
                ? 'Need help? Create a support ticket and we\'ll assist you.'
                : `You don't have any ${filter} tickets at the moment.`}
            </Text>
            {filter === 'all' && (
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/support/contact')}
              >
                <Text style={styles.emptyButtonText}>Create Support Ticket</Text>
              </TouchableOpacity>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.light.textSecondary,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.light.text,
  },
  createButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  createButtonText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  filterTabs: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.light.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: Colors.light.primary,
  },
  filterTabText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.text,
    fontWeight: Typography.fontWeight.medium,
  },
  filterTabTextActive: {
    color: Colors.light.onPrimary,
  },
  ticketsContainer: {
    gap: Spacing.sm,
  },
  ticketCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: Colors.light.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  ticketHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  ticketSubject: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.light.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  ticketDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  ticketMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.light.backgroundSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
    textTransform: 'capitalize',
  },
  ticketDate: {
    fontSize: Typography.fontSize.xs,
    color: Colors.light.textSecondary,
  },
  responseIndicator: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  responseText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.light.success,
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
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  emptyButtonText: {
    color: Colors.light.onPrimary,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
});

