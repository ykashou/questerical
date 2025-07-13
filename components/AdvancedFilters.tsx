import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { X, Filter, Search, Calendar, Clock, Tag, Target, AlertTriangle } from 'lucide-react-native';
import { QuestFilters, QuestType, QuestStatus, PriorityType, DifficultyType } from '@/types/quest';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

interface AdvancedFiltersProps {
  filters: QuestFilters;
  onFiltersChange: (filters: QuestFilters) => void;
  onClose: () => void;
}

export default function AdvancedFilters({ filters, onFiltersChange, onClose }: AdvancedFiltersProps) {
  const { colors } = useThemeStore();
  const { tags } = useQuestStore();
  const [searchQuery, setSearchQuery] = useState('');

  const questTypes: { value: QuestType; label: string; color: string }[] = [
    { value: 'main', label: 'Main', color: colors.questTypes.main },
    { value: 'side', label: 'Side', color: colors.questTypes.side },
    { value: 'mini', label: 'Mini', color: colors.questTypes.mini },
  ];

  const questStatuses: { value: QuestStatus; label: string; icon: React.ReactNode }[] = [
    { value: 'not_started', label: 'Not Started', icon: <Target size={16} color={colors.textSecondary} /> },
    { value: 'in_progress', label: 'In Progress', icon: <Clock size={16} color={colors.primary} /> },
    { value: 'completed', label: 'Completed', icon: <Target size={16} color={colors.success} /> },
    { value: 'paused', label: 'Paused', icon: <Clock size={16} color={colors.warning} /> },
    { value: 'cancelled', label: 'Cancelled', icon: <X size={16} color={colors.danger} /> },
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

  const updateFilter = <K extends keyof QuestFilters>(key: K, value: QuestFilters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleQuestTypeFilter = (value: QuestType) => {
    const currentArray = filters.type || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter('type', newArray.length > 0 ? newArray : undefined);
  };

  const toggleStatusFilter = (value: QuestStatus) => {
    const currentArray = filters.status || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter('status', newArray.length > 0 ? newArray : undefined);
  };

  const togglePriorityFilter = (value: PriorityType) => {
    const currentArray = filters.priority || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter('priority', newArray.length > 0 ? newArray : undefined);
  };

  const toggleDifficultyFilter = (value: DifficultyType) => {
    const currentArray = filters.difficulty || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter('difficulty', newArray.length > 0 ? newArray : undefined);
  };

  const toggleTagFilter = (value: string) => {
    const currentArray = filters.tags || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter('tags', newArray.length > 0 ? newArray : undefined);
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setSearchQuery('');
  };

  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Filter size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Advanced Filters</Text>
        </View>
        <View style={styles.headerActions}>
          {hasActiveFilters && (
            <TouchableOpacity onPress={clearAllFilters} style={styles.clearButton}>
              <Text style={[styles.clearButtonText, { color: colors.danger }]}>Clear All</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Search</Text>
          <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search quests..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Quest Types */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quest Types</Text>
          <View style={styles.filterGrid}>
            {questTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  filters.type?.includes(type.value) && { 
                    backgroundColor: type.color + '20',
                    borderColor: type.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => toggleQuestTypeFilter(type.value)}
              >
                <View style={[styles.typeIndicator, { backgroundColor: type.color }]} />
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.text },
                  filters.type?.includes(type.value) && { fontWeight: '600' }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Status */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Status</Text>
          <View style={styles.filterGrid}>
            {questStatuses.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  filters.status?.includes(status.value) && { 
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => toggleStatusFilter(status.value)}
              >
                {status.icon}
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.text },
                  filters.status?.includes(status.value) && { fontWeight: '600' }
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Priority */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Priority</Text>
          <View style={styles.filterGrid}>
            {priorities.map((priority) => (
              <TouchableOpacity
                key={priority.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  filters.priority?.includes(priority.value) && { 
                    backgroundColor: priority.color + '20',
                    borderColor: priority.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => togglePriorityFilter(priority.value)}
              >
                <AlertTriangle size={14} color={priority.color} />
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.text },
                  filters.priority?.includes(priority.value) && { fontWeight: '600' }
                ]}>
                  {priority.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Difficulty</Text>
          <View style={styles.filterGrid}>
            {difficulties.map((difficulty) => (
              <TouchableOpacity
                key={difficulty.value}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  filters.difficulty?.includes(difficulty.value) && { 
                    backgroundColor: difficulty.color + '20',
                    borderColor: difficulty.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => toggleDifficultyFilter(difficulty.value)}
              >
                <View style={[styles.difficultyDot, { backgroundColor: difficulty.color }]} />
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.text },
                  filters.difficulty?.includes(difficulty.value) && { fontWeight: '600' }
                ]}>
                  {difficulty.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Tags */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tags</Text>
          <View style={styles.filterGrid}>
            {tags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.filterChip,
                  { backgroundColor: colors.card },
                  filters.tags?.includes(tag.id) && { 
                    backgroundColor: tag.color + '20',
                    borderColor: tag.color,
                    borderWidth: 1,
                  }
                ]}
                onPress={() => toggleTagFilter(tag.id)}
              >
                <Tag size={14} color={tag.color} />
                <Text style={[
                  styles.filterChipText, 
                  { color: colors.text },
                  filters.tags?.includes(tag.id) && { fontWeight: '600' }
                ]}>
                  {tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Filters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Filters</Text>
          <View style={styles.filterGrid}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: colors.card },
                filters.isOverdue && { 
                  backgroundColor: colors.danger + '20',
                  borderColor: colors.danger,
                  borderWidth: 1,
                }
              ]}
              onPress={() => updateFilter('isOverdue', !filters.isOverdue)}
            >
              <Calendar size={14} color={colors.danger} />
              <Text style={[
                styles.filterChipText, 
                { color: colors.text },
                filters.isOverdue && { fontWeight: '600' }
              ]}>
                Overdue
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterChip,
                { backgroundColor: colors.card },
                filters.hasTimeEntries && { 
                  backgroundColor: colors.primary + '20',
                  borderColor: colors.primary,
                  borderWidth: 1,
                }
              ]}
              onPress={() => updateFilter('hasTimeEntries', !filters.hasTimeEntries)}
            >
              <Clock size={14} color={colors.primary} />
              <Text style={[
                styles.filterChipText, 
                { color: colors.text },
                filters.hasTimeEntries && { fontWeight: '600' }
              ]}>
                Time Tracked
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 16,
  },
  clearButtonText: {
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  filterChipText: {
    marginLeft: 6,
    fontSize: 14,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});