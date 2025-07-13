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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  statsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    minWidth: 90,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});