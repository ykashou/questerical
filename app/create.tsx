import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Switch } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Zap, Tag, AlertTriangle, Target } from 'lucide-react-native';
import { QuestType, PrivacyType, PriorityType, DifficultyType } from '@/types/quest';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import PrivacySelector from '@/components/PrivacySelector';
import ObjectivesList from '@/components/ObjectivesList';
import AIAssistant from '@/components/AIAssistant';
import { Sparkles } from 'lucide-react-native';

export default function CreateQuestScreen() {
  const params = useLocalSearchParams<{ type: QuestType }>();
  const router = useRouter();
  const { addQuest, tags } = useQuestStore();
  const { colors } = useThemeStore();
  
  const initialType = (params.type as QuestType) || 'main';
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState<string[]>([]);
  const [type, setType] = useState<QuestType>(initialType);
  const [privacy, setPrivacy] = useState<PrivacyType>('private');
  const [priority, setPriority] = useState<PriorityType>('medium');
  const [difficulty, setDifficulty] = useState<DifficultyType>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [estimatedTime, setEstimatedTime] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  
  // Reset form when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setTitle('');
      setDescription('');
      setObjectives([]);
      setType(initialType);
      setPrivacy('private');
      setPriority('medium');
      setDifficulty('medium');
      setDueDate(null);
      setEstimatedTime('');
      setSelectedTags([]);
      setIsRecurring(false);
      
      return () => {};
    }, [initialType])
  );
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    const questTags = tags.filter(tag => selectedTags.includes(tag.id));
    
    addQuest({
      title,
      description,
      objectives: objectives.filter(obj => obj.trim() !== ''),
      type,
      privacy,
      priority,
      difficulty,
      status: 'not_started',
      progress: 0,
      completed: false,
      actualTime: 0,
      timeEntries: [],
      comments: [],
      completedCount: 0,
      streak: 0,
      dueDate: dueDate?.getTime(),
      estimatedTime: estimatedTime ? parseInt(estimatedTime) : undefined,
      tags: questTags,
      dependencies: [],
      isRecurring,
      recurringPattern: isRecurring ? {
        type: 'daily',
        interval: 1,
      } : undefined,
      xpReward: type === 'main' ? 100 : type === 'side' ? 50 : 25,
      isTemplate: false,
    });
    
    router.back();
  };

  const handleAISuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowAIAssistant(false);
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const questTypes: { value: QuestType; label: string }[] = [
    { value: 'main', label: 'Main Quest' },
    { value: 'side', label: 'Side Quest' },
    { value: 'mini', label: 'Mini Quest' },
  ];

  const priorities: { value: PriorityType; label: string; color: string }[] = [
    { value: 'low', label: 'Low', color: colors.textSecondary },
    { value: 'medium', label: 'Medium', color: colors.primary },
    { value: 'high', label: 'High', color: colors.warning },
    { value: 'critical', label: 'Critical', color: colors.danger },
  ];

  const difficulties: { value: DifficultyType; label: string; color: string }[] = [
    { value: 'easy', label: 'Easy', color: colors.success },
    { value: 'medium', label: 'Medium', color: colors.primary },
    { value: 'hard', label: 'Hard', color: colors.warning },
    { value: 'expert', label: 'Expert', color: colors.danger },
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
            {/* Title with AI Assistant */}
            <View style={styles.titleContainer}>
              <View style={styles.titleInputContainer}>
                <TextInput
                  style={[styles.titleInput, { color: colors.text }]}
                  placeholder="Quest Title"
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
                <TouchableOpacity 
                  style={[styles.aiButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowAIAssistant(true)}
                >
                  <Sparkles size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Quest Type */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Quest Type</Text>
              <View style={styles.optionsGrid}>
                {questTypes.map((questType) => (
                  <TouchableOpacity
                    key={questType.value}
                    style={[
                      styles.option,
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
                        styles.optionText,
                        { color: colors.textSecondary },
                        type === questType.value && [styles.selectedOptionText, { color: colors.text }],
                      ]}
                    >
                      {questType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Priority */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority</Text>
              <View style={styles.optionsGrid}>
                {priorities.map((priorityOption) => (
                  <TouchableOpacity
                    key={priorityOption.value}
                    style={[
                      styles.option,
                      { 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      priority === priorityOption.value && { 
                        backgroundColor: priorityOption.color + '20',
                        borderColor: priorityOption.color,
                      },
                    ]}
                    onPress={() => setPriority(priorityOption.value)}
                  >
                    <AlertTriangle size={16} color={priorityOption.color} />
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.textSecondary },
                        priority === priorityOption.value && [styles.selectedOptionText, { color: colors.text }],
                      ]}
                    >
                      {priorityOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Difficulty */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty</Text>
              <View style={styles.optionsGrid}>
                {difficulties.map((difficultyOption) => (
                  <TouchableOpacity
                    key={difficultyOption.value}
                    style={[
                      styles.option,
                      { 
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                      difficulty === difficultyOption.value && { 
                        backgroundColor: difficultyOption.color + '20',
                        borderColor: difficultyOption.color,
                      },
                    ]}
                    onPress={() => setDifficulty(difficultyOption.value)}
                  >
                    <View style={[styles.difficultyDot, { backgroundColor: difficultyOption.color }]} />
                    <Text
                      style={[
                        styles.optionText,
                        { color: colors.textSecondary },
                        difficulty === difficultyOption.value && [styles.selectedOptionText, { color: colors.text }],
                      ]}
                    >
                      {difficultyOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Description */}
            <View style={styles.section}>
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

            {/* Due Date and Estimated Time */}
            <View style={styles.row}>
              <View style={[styles.halfWidth, { marginRight: 8 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Due Date</Text>
                <TouchableOpacity 
                  style={[styles.dateButton, { backgroundColor: colors.card }]}
                  onPress={() => {
                    // Implement date picker
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setDueDate(tomorrow);
                  }}
                >
                  <Calendar size={16} color={colors.textSecondary} />
                  <Text style={[styles.dateButtonText, { color: colors.text }]}>
                    {dueDate ? dueDate.toLocaleDateString() : 'Set date'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={[styles.halfWidth, { marginLeft: 8 }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Est. Time (min)</Text>
                <View style={[styles.timeInputContainer, { backgroundColor: colors.card }]}>
                  <Clock size={16} color={colors.textSecondary} />
                  <TextInput
                    style={[styles.timeInput, { color: colors.text }]}
                    placeholder="60"
                    placeholderTextColor={colors.textSecondary}
                    value={estimatedTime}
                    onChangeText={setEstimatedTime}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Tags */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
              <View style={styles.tagsContainer}>
                {tags.map((tag) => (
                  <TouchableOpacity
                    key={tag.id}
                    style={[
                      styles.tag,
                      { backgroundColor: tag.color + '20' },
                      selectedTags.includes(tag.id) && { 
                        backgroundColor: tag.color + '40',
                        borderColor: tag.color,
                        borderWidth: 1,
                      }
                    ]}
                    onPress={() => toggleTag(tag.id)}
                  >
                    <Tag size={12} color={tag.color} />
                    <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            {/* Objectives */}
            <ObjectivesList objectives={objectives} onChange={setObjectives} />
            
            {/* Privacy */}
            <PrivacySelector value={privacy} onChange={setPrivacy} />

            {/* Recurring */}
            <View style={styles.section}>
              <View style={styles.switchContainer}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Recurring Quest</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: colors.border, true: colors.primary }}
                  thumbColor={colors.text}
                />
              </View>
              <Text style={[styles.switchDescription, { color: colors.textSecondary }]}>
                Quest will repeat daily after completion
              </Text>
            </View>
            
            <View style={styles.spacer} />
          </View>
        </ScrollView>
        
        <View style={[styles.bottomBar, { backgroundColor: colors.background }]}>
          <TouchableOpacity 
            style={[
              styles.createButton, 
              { backgroundColor: colors.primary },
              !title.trim() && styles.disabledButton
            ]} 
            onPress={handleSave}
            disabled={!title.trim()}
          >
            <Zap size={20} color={colors.text} />
            <Text style={[styles.createButtonText, { color: colors.text }]}>Create Quest</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {showAIAssistant && (
        <View style={styles.aiAssistantOverlay}>
          <View style={styles.aiAssistantContainer}>
            <AIAssistant 
              onClose={() => setShowAIAssistant(false)} 
              onSelectSuggestion={handleAISuggestion}
              questType={type}
            />
          </View>
        </View>
      )}
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
  titleInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleInput: {
    fontSize: 24,
    fontWeight: '600',
    padding: 0,
    flex: 1,
  },
  aiButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  section: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: '30%',
  },
  optionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  selectedOptionText: {
    fontWeight: '500',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  descriptionInput: {
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  halfWidth: {
    flex: 1,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  dateButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  timeInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchDescription: {
    fontSize: 14,
    marginTop: 4,
  },
  spacer: {
    height: 60,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  createButtonText: {
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  aiAssistantOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 1000,
  },
  aiAssistantContainer: {
    width: '100%',
    maxWidth: 500,
  },
});