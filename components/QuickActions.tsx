import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { 
  Target, 
  Clock, 
  Zap, 
  Calendar
} from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

export default function QuickActions() {
  const { colors } = useThemeStore();
  const { quests, userStats } = useQuestStore();

  const activeQuests = quests.filter(q => !q.completed);

  const QuickStat = ({ icon, value, label, color }: {
    icon: React.ReactNode;
    value: string | number;
    label: string;
    color: string;
  }) => (
    <View style={[styles.statItem, { 
      backgroundColor: colors.card,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
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
          icon={<Target size={14} color={colors.success} />}
          value={quests.filter(q => q.completed).length}
          label="Completed"
          color={colors.success}
        />
        <QuickStat
          icon={<Clock size={14} color={colors.primary} />}
          value={activeQuests.length}
          label="Active"
          color={colors.primary}
        />
        <QuickStat
          icon={<Zap size={14} color={colors.warning} />}
          value={userStats.level}
          label="Level"
          color={colors.warning}
        />
        <QuickStat
          icon={<Calendar size={14} color={colors.accent} />}
          value={userStats.currentStreak}
          label="Streak"
          color={colors.accent}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  statsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
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
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
});