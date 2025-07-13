import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Scroll, Plus, Sparkles } from 'lucide-react-native';
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
      <View style={[styles.iconContainer, { backgroundColor: colors.questTypes[type] + '15' }]}>
        <Scroll size={48} color={colors.questTypes[type]} />
        <Sparkles size={20} color={colors.questTypes[type]} style={styles.sparkle} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>{getMessage()}</Text>
      <TouchableOpacity 
        style={[styles.button, { backgroundColor: colors.questTypes[type] }]} 
        onPress={handleCreateQuest}
        activeOpacity={0.8}
      >
        <Plus size={20} color={colors.background} />
        <Text style={[styles.buttonText, { color: colors.background }]}>Create Quest</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 10,
    right: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    maxWidth: 280,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});