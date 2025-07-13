import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { 
  Plus, 
  Clock, 
  Target, 
  Zap, 
  Calendar, 
  Filter, 
  BarChart, 
  Search,
  Copy,
  Archive
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

interface QuickActionsProps {
  onCreateQuest?: () => void;
  onShowFilters?: () => void;
  onShowAnalytics?: () => void;
  onSearch?: () => void;
}

export default function QuickActions({ 
  onCreateQuest, 
  onShowFilters, 
  onShowAnalytics,
  onSearch 
}: QuickActionsProps) {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { quests, userStats } = useQuestStore();

  const activeQuests = quests.filter(q => !q.completed);
  const hasActiveTimeTracking = quests.some(q => 
    q.timeEntries.some(entry => !entry.endTime)
  );

  const quickActions = [
    {
      id: 'create',
      icon: <Plus size={20} color={colors.text} />,
      label: 'New Quest',
      color: colors.primary,
      onPress: onCreateQuest || (() => router.push('/create')),
    },
    {
      id: 'timer',
      icon: <Clock size={20} color={colors.text} />,
      label: hasActiveTimeTracking ? 'Timer Active' : 'Start Timer',
      color: hasActiveTimeTracking ? colors.success : colors.accent,
      onPress: () => {
        // Navigate to first active quest or show timer selection
        const firstActiveQuest = activeQuests[0];
        if (firstActiveQuest) {
          router.push(`/quest/${firstActiveQuest.id}`);
        }
      },
    },
    {
      id: 'focus',
      icon: <Target size={20} color={colors.text} />,
      label: 'Focus Mode',
      color: colors.warning,
      onPress: () => {
        // Implement focus mode - could filter to high priority quests
        if (onShowFilters) {
          onShowFilters();
        }
      },
    },
    {
      id: 'analytics',
      icon: <BarChart size={20} color={colors.text} />,
      label: 'Analytics',
      color: colors.secondary,
      onPress: onShowAnalytics || (() => {}),
    },
    {
      id: 'search',
      icon: <Search size={20} color={colors.text} />,
      label: 'Search',
      color: colors.accent,
      onPress: onSearch || (() => {}),
    },
    {
      id: 'calendar',
      icon: <Calendar size={20} color={colors.text} />,
      label: 'Calendar',
      color: colors.primary,
      onPress: () => router.push('/calendar'),
    },
  ];

  const QuickStat = ({ icon, value, label, color }: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View style={[styles.statItem, { backgroundColor: colors.card }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        {icon}
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Quick Stats */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsContainer}
      >
        <QuickStat
          icon={<Target size={16} color={colors.success} />}
          value={quests.filter(q => q.completed).length}
          label="Completed"
          color={colors.success}
        />
        <QuickStat
          icon={<Clock size={16} color={colors.primary} />}
          value={activeQuests.length}
          label="Active"
          color={colors.primary}
        />
        <QuickStat
          icon={<Zap size={16} color={colors.warning} />}
          value={userStats.level}
          label="Level"
          color={colors.warning}
        />
        <QuickStat
          icon={<Calendar size={16} color={colors.accent} />}
          value={userStats.currentStreak}
          label="Streak"
          color={colors.accent}
        />
      </ScrollView>

      {/* Quick Actions */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={action.onPress}
            activeOpacity={0.8}
          >
            {action.icon}
            <Text style={[styles.actionLabel, { color: colors.text }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    minWidth: 80,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 120,
  },
  actionLabel: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
});