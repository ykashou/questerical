import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Edit, Trash2, Share2, CheckCircle, Circle, Lock, Users, Globe } from 'lucide-react-native';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import ObjectivesList from '@/components/ObjectivesList';
import TimerDisplay from '@/components/TimerDisplay';

export default function QuestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useThemeStore();
  
  const quest = useQuestStore((state) => 
    state.quests.find((q) => q.id === id)
  );
  
  const toggleQuestCompletion = useQuestStore((state) => state.toggleQuestCompletion);
  const deleteQuest = useQuestStore((state) => state.deleteQuest);
  
  if (!quest) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Quest not found</Text>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.primary }]} onPress={() => router.back()}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  
  const handleEdit = () => {
    router.push(`/edit/${quest.id}`);
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Quest',
      'Are you sure you want to delete this quest?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            deleteQuest(quest.id);
            router.back();
          }
        },
      ]
    );
  };
  
  const handleShare = async () => {
    if (quest.privacy === 'private') {
      Alert.alert(
        'Private Quest',
        'This quest is set to private. Change the privacy setting to share it.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    try {
      const objectivesList = quest.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n');
      const message = `${quest.title}\n\n${quest.description}\n\nObjectives:\n${objectivesList}`;
      
      const result = await Share.share({
        title: quest.title,
        message: message,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share quest');
    }
  };
  
  const getPrivacyIcon = () => {
    switch (quest.privacy) {
      case 'private':
        return <Lock size={16} color={colors.privacyTypes.private} />;
      case 'shared':
        return <Users size={16} color={colors.privacyTypes.shared} />;
      case 'public':
        return <Globe size={16} color={colors.privacyTypes.public} />;
    }
  };
  
  const getQuestTypeColor = () => {
    return colors.questTypes[quest.type];
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <View style={[styles.typeIndicator, { backgroundColor: getQuestTypeColor() }]} />
            <Text style={[styles.title, { color: colors.text }]}>{quest.title}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.completionButton} 
            onPress={() => toggleQuestCompletion(quest.id)}
          >
            {quest.completed ? (
              <CheckCircle size={28} color={colors.success} />
            ) : (
              <Circle size={28} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.metaInfo}>
          <View style={styles.privacyContainer}>
            {getPrivacyIcon()}
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              {quest.privacy.charAt(0).toUpperCase() + quest.privacy.slice(1)}
            </Text>
          </View>
          
          <Text style={[styles.typeText, { color: colors.textSecondary }]}>
            {quest.type.charAt(0).toUpperCase() + quest.type.slice(1)} Quest
          </Text>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {quest.description || 'No description provided.'}
          </Text>
        </View>
        
        <View style={styles.section}>
          <ObjectivesList 
            objectives={quest.objectives} 
            onChange={() => {}} 
            editable={false} 
          />
        </View>
        
        {/* Timer Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timer</Text>
          <TimerDisplay questId={quest.id} />
          
          {/* Timer Log */}
          {quest.timeEntries.length > 0 && (
            <View style={styles.timerLog}>
              <Text style={[styles.subSectionTitle, { color: colors.text }]}>Time Log</Text>
              {quest.timeEntries.map((entry) => (
                <View key={entry.id} style={[styles.timeEntry, { backgroundColor: colors.card }]}>
                  <Text style={[styles.timeEntryText, { color: colors.text }]}>
                    {new Date(entry.startTime).toLocaleDateString()} - {Math.round(entry.duration)}m
                  </Text>
                  {entry.description && (
                    <Text style={[styles.timeEntryDescription, { color: colors.textSecondary }]}>
                      {entry.description}
                    </Text>
                  )}
                </View>
              ))}
              <View style={[styles.totalTime, { backgroundColor: colors.primary + '20' }]}>
                <Text style={[styles.totalTimeText, { color: colors.primary }]}>
                  Total: {Math.round(quest.actualTime)}m
                </Text>
              </View>
            </View>
          )}
        </View>
        
        {/* Energy Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Energy</Text>
          <View style={[styles.energyContainer, { backgroundColor: colors.card }]}>
            <View style={styles.energyInfo}>
              <Text style={[styles.energyLabel, { color: colors.textSecondary }]}>Story Points</Text>
              <Text style={[styles.energyValue, { color: colors.warning }]}>{quest.xpReward}</Text>
            </View>
            <View style={styles.energyBar}>
              <View style={[styles.energyBarFill, { backgroundColor: colors.warning, width: `${Math.min((quest.xpReward / 100) * 100, 100)}%` }]} />
            </View>
            <Text style={[styles.energyDescription, { color: colors.textSecondary }]}>
              Estimated effort based on difficulty and scope
            </Text>
          </View>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleEdit}>
            <Edit size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card }]} onPress={handleShare}>
            <Share2 size={20} color={colors.text} />
            <Text style={[styles.actionText, { color: colors.text }]}>Share</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton, { backgroundColor: 'rgba(191, 97, 106, 0.1)' }]} 
            onPress={handleDelete}
          >
            <Trash2 size={20} color={colors.danger} />
            <Text style={[styles.actionText, styles.deleteText, { color: colors.danger }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  typeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
    letterSpacing: -0.5,
  },
  completionButton: {
    padding: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  privacyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  privacyText: {
    fontSize: 14,
    marginLeft: 6,
  },
  typeText: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionText: {
    fontWeight: '500',
    marginLeft: 8,
  },
  deleteButton: {
  },
  deleteText: {
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  backButtonText: {
    fontWeight: '600',
  },
  timerLog: {
    marginTop: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  timeEntry: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  timeEntryText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeEntryDescription: {
    fontSize: 12,
    marginTop: 4,
  },
  totalTime: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  totalTimeText: {
    fontSize: 16,
    fontWeight: '700',
  },
  energyContainer: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  energyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  energyLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  energyValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  energyBar: {
    height: 8,
    backgroundColor: 'rgba(235, 203, 139, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  energyBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  energyDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
});