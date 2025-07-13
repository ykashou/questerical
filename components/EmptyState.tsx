import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Scroll, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { QuestType } from '@/types/quest';
import useThemeStore from '@/store/themeStore';

interface EmptyStateProps {
  type: QuestType;
}

export default function EmptyState({ type }: EmptyStateProps) {
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const getTitle = () => {
    switch (type) {
      case 'main': return 'No Main Quests';
      case 'side': return 'No Side Quests';
      case 'mini': return 'No Mini Quests';
    }
  };
  
  const getMessage = () => {
    switch (type) {
      case 'main': return 'Start your journey by creating your first main quest.';
      case 'side': return 'Add some side quests to enhance your adventure.';
      case 'mini': return 'Quick tasks can be added as mini quests.';
    }
  };
  
  const handleCreateQuest = () => {
    router.push({
      pathname: '/create',
      params: { type }
    });
  };
  
  return (
    <View style={styles.container}>
      <Scroll size={48} color={colors.questTypes[type]} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{getMessage()}</Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.questTypes[type] }]} 
        onPress={handleCreateQuest}
      >
        <Plus size={20} color={colors.text} />
        <Text style={[styles.buttonText, { color: colors.text }]}>Create Quest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
    marginLeft: 8,
  },
});