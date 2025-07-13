import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Filter, CheckCheck, Trash2, Settings } from 'lucide-react-native';
import { NotificationType, NotificationPriority } from '@/types/notification';
import useThemeStore from '@/store/themeStore';
import useNotificationStore from '@/store/notificationStore';
import useQuestStore from '@/store/questStore';
import NotificationItem from '@/components/NotificationItem';

export default function NotificationsScreen() {
  const { colors } = useThemeStore();
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearAllNotifications,
    getUnreadNotifications,
    addNotification
  } = useNotificationStore();
  const { quests } = useQuestStore();
  
  const [filter, setFilter] = useState<'all' | 'unread' | NotificationType>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // Generate notifications based on quest states
  useEffect(() => {
    generateQuestNotifications();
  }, [quests]);
  
  const generateQuestNotifications = () => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const existingNotificationQuests = new Set(
      notifications.map(n => n.questId).filter(Boolean)
    );
    
    quests.forEach(quest => {
      // Skip if we already have notifications for this quest
      if (existingNotificationQuests.has(quest.id)) return;
      
      // Due soon notifications (24 hours before due date)
      if (quest.dueDate && !quest.completed) {
        const timeUntilDue = quest.dueDate - now;
        
        if (timeUntilDue > 0 && timeUntilDue <= oneDayMs) {
          addNotification({
            type: 'due_soon',
            priority: quest.priority === 'critical' ? 'urgent' : 'high',
            title: 'Quest Due Soon',
            message: `"${quest.title}" is due in ${Math.ceil(timeUntilDue / (60 * 60 * 1000))} hours`,
            questId: quest.id,
            actionUrl: `/quest/${quest.id}`,
          });
        }
        
        // Overdue notifications
        if (timeUntilDue < 0) {
          const daysPastDue = Math.ceil(Math.abs(timeUntilDue) / oneDayMs);
          addNotification({
            type: 'overdue',
            priority: 'urgent',
            title: 'Quest Overdue',
            message: `"${quest.title}" is ${daysPastDue} day${daysPastDue > 1 ? 's' : ''} overdue`,
            questId: quest.id,
            actionUrl: `/quest/${quest.id}`,
          });
        }
      }
      
      // Recurring quest reminders
      if (quest.isRecurring && quest.completed) {
        const timeSinceCompletion = now - quest.updatedAt;
        const shouldRemind = quest.recurringPattern?.type === 'daily' && timeSinceCompletion >= oneDayMs;
        
        if (shouldRemind) {
          addNotification({
            type: 'recurring',
            priority: 'medium',
            title: 'Recurring Quest Ready',
            message: `Time to start "${quest.title}" again!`,
            questId: quest.id,
            actionUrl: `/quest/${quest.id}`,
          });
        }
      }
    });
  };
  
  const getFilteredNotifications = () => {
    let filtered = notifications;
    
    switch (filter) {
      case 'unread':
        filtered = getUnreadNotifications();
        break;
      case 'all':
        break;
      default:
        filtered = notifications.filter(n => n.type === filter);
    }
    
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    generateQuestNotifications();
    setTimeout(() => setRefreshing(false), 1000);
  };
  
  const filterOptions = [
    { value: 'all', label: 'All', count: notifications.length },
    { value: 'unread', label: 'Unread', count: unreadCount },
    { value: 'due_soon', label: 'Due Soon', count: notifications.filter(n => n.type === 'due_soon').length },
    { value: 'overdue', label: 'Overdue', count: notifications.filter(n => n.type === 'overdue').length },
    { value: 'achievement', label: 'Achievements', count: notifications.filter(n => n.type === 'achievement').length },
  ];
  
  const filteredNotifications = getFilteredNotifications();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Bell size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.danger }]}>
              <Text style={[styles.badgeText, { color: colors.text }]}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {unreadCount > 0 && (
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={markAllAsRead}
            >
              <CheckCheck size={20} color={colors.success} />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={clearAllNotifications}
          >
            <Trash2 size={20} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterOptions}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: colors.card },
                filter === item.value && { 
                  backgroundColor: colors.primary,
                }
              ]}
              onPress={() => setFilter(item.value as any)}
            >
              <Text
                style={[
                  styles.filterText,
                  { color: colors.text },
                  filter === item.value && { color: colors.text, fontWeight: '600' }
                ]}
              >
                {item.label}
              </Text>
              {item.count > 0 && (
                <View style={[
                  styles.filterBadge, 
                  { 
                    backgroundColor: filter === item.value 
                      ? colors.text + '20' 
                      : colors.primary + '20' 
                  }
                ]}>
                  <Text style={[
                    styles.filterBadgeText, 
                    { 
                      color: filter === item.value 
                        ? colors.text 
                        : colors.primary 
                    }
                  ]}>
                    {item.count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
      
      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationItem notification={item} />}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Bell size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filter === 'unread' ? 'No unread notifications' : 'No notifications'}
            </Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              {filter === 'unread' 
                ? 'All caught up! Check back later for updates.'
                : 'Notifications about your quests will appear here.'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 8,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  filtersContainer: {
    paddingVertical: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterBadge: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 18,
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});