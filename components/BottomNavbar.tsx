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
        style={styles.iconButton}
        onPress={handleCreateQuest}
        activeOpacity={0.6}
      >
        <Plus size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleStartTimer}
        activeOpacity={0.6}
      >
        <Clock size={24} color={hasActiveTimeTracking ? colors.success : colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={handleFocusMode}
        activeOpacity={0.6}
      >
        <Target size={24} color={colors.warning} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});