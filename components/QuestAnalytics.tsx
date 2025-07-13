import React from 'react';
import { StyleSheet, Text, View, ScrollView, Dimensions } from 'react-native';
import { BarChart, PieChart, LineChart } from 'react-native-chart-kit';
import { Trophy, Target, Clock, Zap, TrendingUp, Calendar } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

const screenWidth = Dimensions.get('window').width;

export default function QuestAnalytics() {
  const { colors } = useThemeStore();
  const { quests, userStats } = useQuestStore();

  // Calculate analytics data
  const completedQuests = quests.filter(q => q.completed);
  const totalQuests = quests.length;
  const completionRate = totalQuests > 0 ? (completedQuests.length / totalQuests) * 100 : 0;

  // Quest type distribution
  const questTypeData = [
    {
      name: 'Main',
      population: quests.filter(q => q.type === 'main').length,
      color: colors.questTypes.main,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Side',
      population: quests.filter(q => q.type === 'side').length,
      color: colors.questTypes.side,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Mini',
      population: quests.filter(q => q.type === 'mini').length,
      color: colors.questTypes.mini,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ];

  // Priority distribution
  const priorityData = {
    labels: ['Low', 'Medium', 'High', 'Critical'],
    datasets: [{
      data: [
        quests.filter(q => q.priority === 'low').length,
        quests.filter(q => q.priority === 'medium').length,
        quests.filter(q => q.priority === 'high').length,
        quests.filter(q => q.priority === 'critical').length,
      ]
    }]
  };

  // Weekly completion trend (last 7 days)
  const getWeeklyCompletions = () => {
    const today = new Date();
    const weekData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).getTime();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).getTime();
      
      const dayCompletions = completedQuests.filter(q => 
        q.updatedAt >= dayStart && q.updatedAt <= dayEnd
      ).length;
      
      weekData.push(dayCompletions);
    }
    
    return weekData;
  };

  const weeklyData = {
    labels: ['6d', '5d', '4d', '3d', '2d', '1d', 'Today'],
    datasets: [{
      data: getWeeklyCompletions(),
      color: (opacity = 1) => colors.primary,
      strokeWidth: 2,
    }]
  };

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.primary,
    labelColor: (opacity = 1) => colors.text,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: colors.primary,
    },
  };

  const StatCard = ({ icon, title, value, subtitle, color }: {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    subtitle?: string;
    color?: string;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: (color || colors.primary) + '20' }]}>
          {icon}
        </View>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      {subtitle && (
        <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Quest Analytics</Text>
      
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={<Trophy size={20} color={colors.warning} />}
          title="Level"
          value={userStats.level}
          subtitle={`${userStats.totalXP} XP`}
          color={colors.warning}
        />
        
        <StatCard
          icon={<Target size={20} color={colors.success} />}
          title="Completed"
          value={completedQuests.length}
          subtitle={`${completionRate.toFixed(1)}% rate`}
          color={colors.success}
        />
        
        <StatCard
          icon={<Clock size={20} color={colors.primary} />}
          title="Time Spent"
          value={`${Math.round(userStats.totalTimeSpent / 60)}h`}
          subtitle={`${userStats.totalTimeSpent % 60}m`}
          color={colors.primary}
        />
        
        <StatCard
          icon={<Zap size={20} color={colors.accent} />}
          title="Current Streak"
          value={userStats.currentStreak}
          subtitle={`Best: ${userStats.longestStreak}`}
          color={colors.accent}
        />
      </View>

      {/* Weekly Completion Trend */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Weekly Completions</Text>
        <LineChart
          data={weeklyData}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Quest Type Distribution */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Quest Types</Text>
        <PieChart
          data={questTypeData}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          style={styles.chart}
        />
      </View>

      {/* Priority Distribution */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Priority Distribution</Text>
        <BarChart
          data={priorityData}
          width={screenWidth - 64}
          height={200}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </View>

      {/* Achievements */}
      <View style={[styles.achievementsContainer, { backgroundColor: colors.card }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>Recent Achievements</Text>
        {userStats.achievements
          .filter(achievement => achievement.unlockedAt)
          .slice(-3)
          .map((achievement) => (
            <View key={achievement.id} style={styles.achievementItem}>
              <Text style={styles.achievementIcon}>{achievement.icon}</Text>
              <View style={styles.achievementContent}>
                <Text style={[styles.achievementName, { color: colors.text }]}>
                  {achievement.name}
                </Text>
                <Text style={[styles.achievementDescription, { color: colors.textSecondary }]}>
                  {achievement.description}
                </Text>
              </View>
              <View style={[styles.xpBadge, { backgroundColor: colors.warning + '20' }]}>
                <Text style={[styles.xpBadgeText, { color: colors.warning }]}>
                  +{achievement.xpReward} XP
                </Text>
              </View>
            </View>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtitle: {
    fontSize: 12,
  },
  chartContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: {
    borderRadius: 8,
  },
  achievementsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementContent: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 14,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});