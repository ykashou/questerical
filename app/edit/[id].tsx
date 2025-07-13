import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QuestType, PrivacyType } from '@/types/quest';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import PrivacySelector from '@/components/PrivacySelector';
import ObjectivesList from '@/components/ObjectivesList';

export default function EditQuestScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const quests = useQuestStore((state) => state.quests);
  const updateQuest = useQuestStore((state) => state.updateQuest);
  const { colors } = useThemeStore();
  
  const quest = quests.find((q) => q.id === id);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [type, setType] = useState<QuestType>('main');
  const [privacy, setPrivacy] = useState<PrivacyType>('private');
  
  useEffect(() => {
    if (quest) {
      setTitle(quest.title);
      setDescription(quest.description);
      setObjectives(quest.objectives);
      setType(quest.type);
      setPrivacy(quest.privacy);
    }
  }, [quest]);
  
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
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    updateQuest(quest.id, {
      title,
      description,
      objectives: objectives.filter(obj => obj.trim() !== ''),
      type,
      privacy,
    });
    
    router.back();
  };
  
  const questTypes: { value: QuestType; label: string }[] = [
    { value: 'main', label: 'Main Quest' },
    { value: 'side', label: 'Side Quest' },
    { value: 'mini', label: 'Mini Quest' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.form}>
            <View style={styles.titleContainer}>
              <TextInput
                style={[styles.titleInput, { color: colors.text }]}
                placeholder="Quest Title"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
            
            <View style={styles.typeSelector}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quest Type</Text>
              <View style={styles.typeOptions}>
                {questTypes.map((questType) => (
                  <TouchableOpacity
                    key={questType.value}
                    style={[
                      styles.typeOption,
                      { 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      type === questType.value && { 
                        backgroundColor: colors.questTypes[questType.value],
                        borderColor: colors.questTypes[questType.value],
                      },
                    ]}
                    onPress={() => setType(questType.value)}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        { color: colors.textSecondary },
                        type === questType.value && [styles.selectedTypeOptionText, { color: colors.text }],
                      ]}
                    >
                      {questType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.descriptionContainer}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
              <TextInput
                style={[styles.descriptionInput, { backgroundColor: colors.card, color: colors.text }]}
                placeholder="Describe your quest..."
                placeholderTextColor={colors.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
              />
            </View>
            
            <ObjectivesList objectives={objectives} onChange={setObjectives} />
            
            <PrivacySelector value={privacy} onChange={setPrivacy} />
            
            <View style={styles.spacer} />
          </View>
        </ScrollView>
        
        <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: colors.primary },
              !title.trim() && styles.disabledButton
            ]} 
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Text style={[styles.saveButtonText, { color: colors.text }]}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  form: {
    gap: 20,
  },
  titleContainer: {
    marginTop: 8,
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    marginBottom: 4,
  },
  typeOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  typeOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  typeOptionText: {
    fontSize: 14,
  },
  selectedTypeOptionText: {
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 4,
  },
  descriptionInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  spacer: {
    height: 60,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  saveButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Make button full width
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 24,
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
});