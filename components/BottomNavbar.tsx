import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform } from 'react-native';
import { Plus, Clock, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

interface BottomNavbarProps {
  onCreateQuest?: () => void;
  onStartTimer?: () => void;
  onFocusMode?: () => void;
}

export default function BottomNavbar({ 
  onCreateQuest, 
  onStartTimer, 
  onFocusMode 
}: BottomNavbarProps) {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { quests } = useQuestStore();

  const activeQuests = quests.filter(q => !q.completed);
  const hasActiveTimeTracking = quests.some(q => 
    q.timeEntries.some(entry => !entry.endTime)
  );

  const handleCreateQuest = () => {
    if (onCreateQuest) {
      onCreateQuest();
    } else {
      router.push('/create');
    }
  };

  const handleStartTimer = () => {
    if (onStartTimer) {
      onStartTimer();
    } else {
      // Navigate to first active quest or show timer selection
      const firstActiveQuest = activeQuests[0];
      if (firstActiveQuest) {
        router.push(`/quest/${firstActiveQuest.id}`);
      }
    }
  };

  const handleFocusMode = () => {
    if (onFocusMode) {
      onFocusMode();
    } else {
      // Implement focus mode logic
      console.log('Focus mode activated');
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      paddingBottom: Platform.OS === 'ios' ? 34 : 16, // Account for home indicator on iOS
    }]}>
      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.primary }]}
        onPress={handleCreateQuest}
        activeOpacity={0.8}
      >
        <Plus size={20} color={colors.background} />
        <Text style={[styles.actionLabel, { color: colors.background }]}>
          New Quest
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { 
          backgroundColor: hasActiveTimeTracking ? colors.success : colors.accent 
        }]}
        onPress={handleStartTimer}
        activeOpacity={0.8}
      >
        <Clock size={20} color={colors.background} />
        <Text style={[styles.actionLabel, { color: colors.background }]}>
          {hasActiveTimeTracking ? 'Timer Active' : 'Start Timer'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, { backgroundColor: colors.warning }]}
        onPress={handleFocusMode}
        activeOpacity={0.8}
      >
        <Target size={20} color={colors.background} />
        <Text style={[styles.actionLabel, { color: colors.background }]}>
          Focus Mode
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});