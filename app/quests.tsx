import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ScrollView, Dimensions, Platform, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Search, MoreVertical, Grid, List, TestTube, Sparkles } from 'lucide-react-native';
import Animated, { useSharedValue } from 'react-native-reanimated';
import { QuestType, Quest, QuestFilters } from '@/types/quest';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';
import QuestCard from '@/components/QuestCard';
import EmptyState from '@/components/EmptyState';
import DraggableQuestCard from '@/components/DraggableQuestCard';
import BottomNavbar from '@/components/BottomNavbar';
import AdvancedFilters from '@/components/AdvancedFilters';
import TimerDisplay from '@/components/TimerDisplay';
import FocusModeOverlay from '@/components/FocusModeOverlay';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_HEIGHT = 120; // Reduced height for better spacing

export default function QuestsScreen() {
  const router = useRouter();
  const { 
    quests, 
    reorderQuests, 
    searchQuests, 
    filterQuests, 
    bulkUpdateQuests, 
    bulkDeleteQuests,
    isSandboxMode 
  } = useQuestStore();
  const { colors } = useThemeStore();
  const { currentSession, focusMode } = useTimerStore();
  
  const [activeTab, setActiveTab] = useState<QuestType>('main');
  const [showCompleted, setShowCompleted] = useState(false);
  const [orderedQuests, setOrderedQuests] = useState<Quest[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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
      <StatusBar 
        barStyle={colors.background === '#FEFEFE' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background} 
      />
      
      {/* Sandbox Mode Banner */}
      {isSandboxMode && (
        <View style={[styles.sandboxBanner, { backgroundColor: colors.primary }]}>
          <TestTube size={16} color={colors.background} />
          <Text style={[styles.sandboxText, { color: colors.background }]}>
            Sandbox Mode - Using sample data
          </Text>
        </View>
      )}
      
      {/* Focus Mode Overlay */}
      <FocusModeOverlay />
      
      {/* Timer Display */}
      {currentSession && (
        <View style={styles.timerContainer}>
          <TimerDisplay compact />
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Your Quests</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.appTitle, { color: colors.text }]}>Quest Management</Text>
              <Sparkles size={20} color={colors.primary} />
            </View>
          </View>
        </View>
        
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
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                activeTab === tab.value && { 
                  backgroundColor: colors.questTypes[tab.value],
                  borderColor: colors.questTypes[tab.value],
                  shadowColor: colors.questTypes[tab.value],
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4,
                  elevation: 4,
                },
              ]}
              onPress={() => setActiveTab(tab.value)}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  activeTab === tab.value && [styles.activeTabText, { color: colors.background }],
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

      {/* Bottom Navbar */}
      <BottomNavbar 
        onCreateQuest={() => router.push('/create')}
      />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sandboxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  sandboxText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTop: {
    marginBottom: 20,
  },
  welcomeSection: {
    gap: 4,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tabsContainer: {
    paddingRight: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120, // Add space for bottom navbar
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
});