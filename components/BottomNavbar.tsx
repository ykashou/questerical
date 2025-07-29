import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from 'react-native';
import { Plus, Clock, Target } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';
import useTimerStore from '@/store/timerStore';

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
  const { 
    currentSession, 
    timerState, 
    startTimer, 
    stopTimer, 
    focusMode, 
    enableFocusMode, 
    disableFocusMode 
  } = useTimerStore();
  const [showTimerOptions, setShowTimerOptions] = useState(false);

  const activeQuests = quests.filter(q => !q.completed);
  const hasActiveTimeTracking = quests.some(q => 
    q.timeEntries.some(entry => !entry.endTime)
  );
  const isTimerActive = timerState === 'running' || timerState === 'paused';

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
      return;
    }
    
    if (isTimerActive) {
      // Stop current timer
      Alert.alert(
        'Stop Timer',
        'Are you sure you want to stop the current timer session?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Stop', 
            style: 'destructive',
            onPress: () => stopTimer(false)
          },
        ]
      );
    } else {
      // Show timer options
      Alert.alert(
        'Start Timer',
        'Choose a timer mode:',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Pomodoro (25 min)', 
            onPress: () => startTimer('pomodoro')
          },
          { 
            text: 'Focus Session (60 min)', 
            onPress: () => startTimer('focus', 60)
          },
          { 
            text: 'Quick Timer (15 min)', 
            onPress: () => startTimer('custom', 15)
          },
        ]
      );
    }
  };

  const handleFocusMode = () => {
    if (onFocusMode) {
      onFocusMode();
      return;
    }
    
    if (focusMode.isActive) {
      // Disable focus mode
      Alert.alert(
        'Exit Focus Mode',
        'Are you sure you want to exit focus mode?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Exit Focus', 
            onPress: disableFocusMode
          },
        ]
      );
    } else {
      // Enable focus mode with active quests
      const activeQuestIds = activeQuests.slice(0, 3).map(q => q.id); // Limit to 3 quests
      enableFocusMode(activeQuestIds, {
        hideDistractions: true,
        customMessage: 'Stay focused on your active quests!'
      });
    }
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.card,
      borderTopColor: colors.border,
      paddingBottom: Platform.OS === 'ios' ? 28 : 12, // Account for home indicator on iOS
    }]}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: colors.primary + '15' }]}
        onPress={handleCreateQuest}
        activeOpacity={0.7}
      >
        <Plus size={20} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconButton, isTimerActive && { backgroundColor: colors.success + '15' }]}
        onPress={handleStartTimer}
        activeOpacity={0.7}
      >
        <Clock size={20} color={isTimerActive ? colors.success : hasActiveTimeTracking ? colors.warning : colors.text} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.iconButton, focusMode.isActive && { backgroundColor: colors.success + '15' }]}
        onPress={handleFocusMode}
        activeOpacity={0.7}
      >
        <Target size={20} color={focusMode.isActive ? colors.success : colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopWidth: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 4,
  },
  iconButton: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
});