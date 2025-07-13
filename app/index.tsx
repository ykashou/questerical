import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Search, MoreVertical, Grid, List } from 'lucide-react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { QuestType, Quest, QuestFilters } from '@/types/quest';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import QuestCard from '@/components/QuestCard';
import EmptyState from '@/components/EmptyState';
import DraggableQuestCard from '@/components/DraggableQuestCard';
import QuickActions from '@/components/QuickActions';
import AdvancedFilters from '@/components/AdvancedFilters';
import QuestAnalytics from '@/components/QuestAnalytics';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HEIGHT = 140; // Updated for new card design

export default function HomeScreen() {
  const router = useRouter();
  const { 
    quests, 
    reorderQuests, 
    searchQuests, 
    filterQuests, 
    bulkUpdateQuests, 
    bulkDeleteQuests 
  } = useQuestStore();
  const { colors } = useThemeStore();
  
  const [activeTab, setActiveTab] = useState<QuestType>('main');
  const [showCompleted, setShowCompleted] = useState(false);
  const [orderedQuests, setOrderedQuests] = useState<Quest[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [filters, setFilters] = useState<QuestFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const scrollY = useSharedValue(0);

  // Filter and sort quests
  useEffect(() => {
    let filtered = quests;
    
    // Apply search
    if (searchQuery.trim()) {
      filtered = searchQuests(searchQuery);
    }
    
    // Apply filters
    if (Object.keys(filters).length > 0) {
      filtered = filterQuests(filters);
    }
    
    // Apply tab filter
    filtered = filtered.filter(
      (quest) => quest.type === activeTab && (showCompleted || !quest.completed)
    );
    
    // Sort by order property if available, otherwise by creation date
    const sorted = [...filtered].sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.createdAt - b.createdAt;
    });
    
    setOrderedQuests(sorted);
  }, [quests, activeTab, showCompleted, filters, searchQuery]);

  const handleMoveItem = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    const newQuests = [...orderedQuests];
    const item = newQuests.splice(fromIndex, 1)[0];
    newQuests.splice(toIndex, 0, item);
    
    setOrderedQuests(newQuests);
  }, [orderedQuests]);

  const handleDragEnd = useCallback(() => {
    reorderQuests(orderedQuests);
  }, [orderedQuests, reorderQuests]);

  const handleQuestSelect = (questId: string) => {
    if (isSelectionMode) {
      setSelectedQuests(prev => 
        prev.includes(questId) 
          ? prev.filter(id => id !== questId)
          : [...prev, questId]
      );
    } else {
      router.push(`/quest/${questId}`);
    }
  };

  const handleBulkAction = (action: 'complete' | 'delete' | 'archive') => {
    switch (action) {
      case 'complete':
        bulkUpdateQuests(selectedQuests, { completed: true, status: 'completed' });
        break;
      case 'delete':
        bulkDeleteQuests(selectedQuests);
        break;
      case 'archive':
        // Implement archive functionality
        break;
    }
    setSelectedQuests([]);
    setIsSelectionMode(false);
  };

  const renderQuestList = useCallback(() => {
    if (orderedQuests.length === 0) {
      if (searchQuery || Object.keys(filters).length > 0) {
        return (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No quests found</Text>
            <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
              Try adjusting your search or filters
            </Text>
          </View>
        );
      }
      return <EmptyState type={activeTab} />;
    }

    // On web, use regular FlatList without drag functionality
    if (Platform.OS === 'web') {
      return (
        <FlatList
          data={orderedQuests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <QuestCard 
              quest={item} 
              isSelected={selectedQuests.includes(item.id)}
              onSelect={handleQuestSelect}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      );
    }

    // On mobile, use draggable list
    return (
      <Animated.FlatList
        data={orderedQuests}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <DraggableQuestCard
            quest={item}
            index={index}
            questsCount={orderedQuests.length}
            onDragEnd={handleDragEnd}
            onMoveItem={handleMoveItem}
            scrollY={scrollY}
            cardHeight={CARD_HEIGHT}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        onScroll={(e) => {
          scrollY.value = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      />
    );
  }, [orderedQuests, activeTab, handleMoveItem, handleDragEnd, scrollY, selectedQuests, isSelectionMode]);

  const tabs: { value: QuestType; label: string }[] = [
    { value: 'main', label: 'Main Quests' },
    { value: 'side', label: 'Side Quests' },
    { value: 'mini', label: 'Mini Quests' },
  ];

  const hasActiveFilters = Object.keys(filters).length > 0 || searchQuery.trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Quick Actions */}
      <QuickActions 
        onCreateQuest={() => router.push('/create')}
        onShowFilters={() => setShowFilters(true)}
        onShowAnalytics={() => setShowAnalytics(true)}
        onSearch={() => {/* Implement search modal */}}
      />

      {/* Header */}
      <View style={styles.header}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.tab,
                { 
                  borderColor: colors.border,
                },
                activeTab === tab.value && { 
                  backgroundColor: colors.questTypes[tab.value],
                  borderColor: colors.questTypes[tab.value],
                },
              ]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === tab.value && [styles.activeTabText, { color: colors.text }],
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.actionButton, hasActiveFilters && { backgroundColor: colors.primary + '20' }]} 
            onPress={() => setShowFilters(true)}
          >
            <Filter size={18} color={hasActiveFilters ? colors.primary : colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setShowCompleted(!showCompleted)}
          >
            <Text style={[styles.filterText, { color: colors.text }]}>
              {showCompleted ? 'Hide' : 'Show'} Done
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setIsSelectionMode(!isSelectionMode)}
          >
            <MoreVertical size={18} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={[styles.selectionHeader, { backgroundColor: colors.card }]}>
          <Text style={[styles.selectionText, { color: colors.text }]}>
            {selectedQuests.length} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity 
              style={[styles.selectionButton, { backgroundColor: colors.success }]}
              onPress={() => handleBulkAction('complete')}
            >
              <Text style={[styles.selectionButtonText, { color: colors.text }]}>Complete</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.selectionButton, { backgroundColor: colors.danger }]}
              onPress={() => handleBulkAction('delete')}
            >
              <Text style={[styles.selectionButtonText, { color: colors.text }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {renderQuestList()}
      </View>

      {/* Filters Modal */}
      {showFilters && (
        <View style={styles.modalOverlay}>
          <AdvancedFilters
            filters={filters}
            onFiltersChange={setFilters}
            onClose={() => setShowFilters(false)}
          />
        </View>
      )}

      {/* Analytics Modal */}
      {showAnalytics && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
            <QuestAnalytics />
            <TouchableOpacity 
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowAnalytics(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>Close</Text>
            </TouchableOpacity>
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
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabsContainer: {
    paddingRight: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: {
    fontWeight: '500',
  },
  activeTabText: {
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    width: '100%',
  },
  list: {
    width: '100%',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalOverlay: {
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
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
    borderRadius: 16,
    padding: 20,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  closeButtonText: {
    fontWeight: '600',
  },
});