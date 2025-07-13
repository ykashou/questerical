import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Quest, 
  QuestStore, 
  PrivacyType, 
  QuestStatus, 
  QuestTag, 
  TimeEntry, 
  QuestTemplate,
  UserStats,
  Achievement,
  QuestFilters,
  PriorityType,
  DifficultyType
} from '@/types/quest';

// Default achievements
const defaultAchievements: Achievement[] = [
  {
    id: 'first_quest',
    name: 'First Steps',
    description: 'Complete your first quest',
    icon: '🎯',
    progress: 0,
    maxProgress: 1,
    xpReward: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Complete quests for 7 days in a row',
    icon: '🔥',
    progress: 0,
    maxProgress: 7,
    xpReward: 200,
  },
  {
    id: 'quest_master',
    name: 'Quest Master',
    description: 'Complete 100 quests',
    icon: '👑',
    progress: 0,
    maxProgress: 100,
    xpReward: 1000,
  },
  {
    id: 'time_tracker',
    name: 'Time Master',
    description: 'Track time for 50 hours',
    icon: '⏰',
    progress: 0,
    maxProgress: 3000, // 50 hours in minutes
    xpReward: 500,
  },
];

const defaultUserStats: UserStats = {
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  totalQuestsCompleted: 0,
  totalTimeSpent: 0,
  averageCompletionTime: 0,
  completionRate: 0,
  achievements: defaultAchievements,
};

const useQuestStore = create<QuestStore>()(
  persist(
    (set, get) => ({
      quests: [],
      templates: [],
      tags: [
        { id: '1', name: 'Work', color: '#5E81AC' },
        { id: '2', name: 'Personal', color: '#A3BE8C' },
        { id: '3', name: 'Health', color: '#BF616A' },
        { id: '4', name: 'Learning', color: '#EBCB8B' },
        { id: '5', name: 'Creative', color: '#B48EAD' },
      ],
      userStats: defaultUserStats,
      
      addQuest: (quest) => set((state) => {
        const newQuest: Quest = {
          ...quest,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: state.quests.length,
          status: 'not_started',
          progress: 0,
          actualTime: 0,
          timeEntries: [],
          comments: [],
          completedCount: 0,
          streak: 0,
          xpReward: quest.type === 'main' ? 100 : quest.type === 'side' ? 50 : 25,
          tags: quest.tags || [],
          dependencies: quest.dependencies || [],
          isRecurring: quest.isRecurring || false,
          isTemplate: false,
        };
        
        // Trigger notification generation
        setTimeout(() => {
          const notificationStore = require('@/store/notificationStore').default;
          if (notificationStore.getState) {
            notificationStore.getState().generateQuestNotifications();
          }
        }, 100);
        
        return { quests: [...state.quests, newQuest] };
      }),
      
      updateQuest: (id, updates) => set((state) => {
        const updatedQuests = state.quests.map((quest) => 
          quest.id === id 
            ? { ...quest, ...updates, updatedAt: Date.now() } 
            : quest
        );
        
        // Trigger notification generation
        setTimeout(() => {
          const notificationStore = require('@/store/notificationStore').default;
          if (notificationStore.getState) {
            notificationStore.getState().generateQuestNotifications();
          }
        }, 100);
        
        return { quests: updatedQuests };
      }),
      
      deleteQuest: (id) => set((state) => ({
        quests: state.quests.filter((quest) => quest.id !== id),
      })),
      
      duplicateQuest: (id) => set((state) => {
        const originalQuest = state.quests.find(q => q.id === id);
        if (!originalQuest) return state;
        
        const duplicatedQuest: Quest = {
          ...originalQuest,
          id: Date.now().toString(),
          title: `${originalQuest.title} (Copy)`,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: 'not_started',
          progress: 0,
          completed: false,
          actualTime: 0,
          timeEntries: [],
          comments: [],
          completedCount: 0,
          streak: 0,
        };
        
        return { quests: [...state.quests, duplicatedQuest] };
      }),
      
      toggleQuestCompletion: (id) => set((state) => {
        const quest = state.quests.find(q => q.id === id);
        if (!quest) return state;
        
        const newCompleted = !quest.completed;
        const newStatus: QuestStatus = newCompleted ? 'completed' : 'not_started';
        const newProgress = newCompleted ? 100 : 0;
        
        const updatedQuests = state.quests.map((q) => 
          q.id === id 
            ? { 
                ...q, 
                completed: newCompleted, 
                status: newStatus,
                progress: newProgress,
                updatedAt: Date.now(),
                completedCount: newCompleted ? q.completedCount + 1 : Math.max(0, q.completedCount - 1)
              } 
            : q
        );
        
        // Update user stats
        const newStats = { ...state.userStats };
        if (newCompleted) {
          newStats.totalQuestsCompleted += 1;
          newStats.totalXP += quest.xpReward;
          newStats.level = Math.floor(newStats.totalXP / 1000) + 1;
          
          // Generate completion notification
          setTimeout(() => {
            const notificationStore = require('@/store/notificationStore').default;
            if (notificationStore.getState) {
              notificationStore.getState().addNotification({
                type: 'completion',
                priority: 'medium',
                title: 'Quest Completed!',
                message: `Congratulations! You completed "${quest.title}" and earned ${quest.xpReward} XP.`,
                questId: quest.id,
              });
            }
          }, 100);
        } else {
          newStats.totalQuestsCompleted = Math.max(0, newStats.totalQuestsCompleted - 1);
          newStats.totalXP = Math.max(0, newStats.totalXP - quest.xpReward);
          newStats.level = Math.floor(newStats.totalXP / 1000) + 1;
        }
        
        return { 
          quests: updatedQuests,
          userStats: newStats
        };
      }),
      
      updateQuestStatus: (id, status) => set((state) => ({
        quests: state.quests.map((quest) => 
          quest.id === id 
            ? { 
                ...quest, 
                status, 
                completed: status === 'completed',
                progress: status === 'completed' ? 100 : quest.progress,
                updatedAt: Date.now() 
              } 
            : quest
        ),
      })),
      
      updateQuestProgress: (id, progress) => set((state) => ({
        quests: state.quests.map((quest) => 
          quest.id === id 
            ? { 
                ...quest, 
                progress: Math.max(0, Math.min(100, progress)),
                status: progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started',
                completed: progress === 100,
                updatedAt: Date.now() 
              } 
            : quest
        ),
      })),
      
      updateQuestPrivacy: (id, privacy: PrivacyType) => set((state) => ({
        quests: state.quests.map((quest) => 
          quest.id === id 
            ? { ...quest, privacy, updatedAt: Date.now() } 
            : quest
        ),
      })),
      
      reorderQuests: (reorderedQuests) => set(() => ({
        quests: reorderedQuests.map((quest, index) => ({
          ...quest,
          order: index,
          updatedAt: Date.now(),
        })),
      })),
      
      bulkUpdateQuests: (questIds, updates) => set((state) => ({
        quests: state.quests.map((quest) => 
          questIds.includes(quest.id)
            ? { ...quest, ...updates, updatedAt: Date.now() }
            : quest
        ),
      })),
      
      bulkDeleteQuests: (questIds) => set((state) => ({
        quests: state.quests.filter((quest) => !questIds.includes(quest.id)),
      })),
      
      startTimeTracking: (questId) => set((state) => {
        const quest = state.quests.find(q => q.id === questId);
        if (!quest) return state;
        
        // Check if there's already an active time entry
        const hasActiveEntry = quest.timeEntries.some(entry => !entry.endTime);
        if (hasActiveEntry) return state;
        
        const newTimeEntry: TimeEntry = {
          id: Date.now().toString(),
          startTime: Date.now(),
          duration: 0,
        };
        
        return {
          quests: state.quests.map(q => 
            q.id === questId
              ? { 
                  ...q, 
                  timeEntries: [...q.timeEntries, newTimeEntry],
                  status: q.status === 'not_started' ? 'in_progress' : q.status,
                  updatedAt: Date.now()
                }
              : q
          )
        };
      }),
      
      stopTimeTracking: (questId, description) => set((state) => {
        const quest = state.quests.find(q => q.id === questId);
        if (!quest) return state;
        
        const activeEntryIndex = quest.timeEntries.findIndex(entry => !entry.endTime);
        if (activeEntryIndex === -1) return state;
        
        const activeEntry = quest.timeEntries[activeEntryIndex];
        const endTime = Date.now();
        const duration = Math.round((endTime - activeEntry.startTime) / 60000); // Convert to minutes
        
        const updatedTimeEntries = [...quest.timeEntries];
        updatedTimeEntries[activeEntryIndex] = {
          ...activeEntry,
          endTime,
          duration,
          description,
        };
        
        const totalActualTime = quest.actualTime + duration;
        
        return {
          quests: state.quests.map(q => 
            q.id === questId
              ? { 
                  ...q, 
                  timeEntries: updatedTimeEntries,
                  actualTime: totalActualTime,
                  updatedAt: Date.now()
                }
              : q
          ),
          userStats: {
            ...state.userStats,
            totalTimeSpent: state.userStats.totalTimeSpent + duration,
          }
        };
      }),
      
      addTimeEntry: (questId, entry) => set((state) => {
        const newTimeEntry: TimeEntry = {
          ...entry,
          id: Date.now().toString(),
        };
        
        return {
          quests: state.quests.map(q => 
            q.id === questId
              ? { 
                  ...q, 
                  timeEntries: [...q.timeEntries, newTimeEntry],
                  actualTime: q.actualTime + entry.duration,
                  updatedAt: Date.now()
                }
              : q
          )
        };
      }),
      
      addComment: (questId, text) => set((state) => {
        const newComment = {
          id: Date.now().toString(),
          text,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        return {
          quests: state.quests.map(q => 
            q.id === questId
              ? { 
                  ...q, 
                  comments: [...q.comments, newComment],
                  updatedAt: Date.now()
                }
              : q
          )
        };
      }),
      
      updateComment: (questId, commentId, text) => set((state) => ({
        quests: state.quests.map(q => 
          q.id === questId
            ? { 
                ...q, 
                comments: q.comments.map(comment =>
                  comment.id === commentId
                    ? { ...comment, text, updatedAt: Date.now() }
                    : comment
                ),
                updatedAt: Date.now()
              }
            : q
        )
      })),
      
      deleteComment: (questId, commentId) => set((state) => ({
        quests: state.quests.map(q => 
          q.id === questId
            ? { 
                ...q, 
                comments: q.comments.filter(comment => comment.id !== commentId),
                updatedAt: Date.now()
              }
            : q
        )
      })),
      
      addTag: (tag) => set((state) => {
        const newTag: QuestTag = {
          ...tag,
          id: Date.now().toString(),
        };
        return { tags: [...state.tags, newTag] };
      }),
      
      updateTag: (id, updates) => set((state) => ({
        tags: state.tags.map(tag => 
          tag.id === id ? { ...tag, ...updates } : tag
        ),
      })),
      
      deleteTag: (id) => set((state) => ({
        tags: state.tags.filter(tag => tag.id !== id),
        quests: state.quests.map(quest => ({
          ...quest,
          tags: quest.tags.filter(tag => tag.id !== id),
        })),
      })),
      
      createTemplate: (quest, name, category) => set((state) => {
        const template: QuestTemplate = {
          id: Date.now().toString(),
          name,
          description: `Template based on "${quest.title}"`,
          category,
          isPublic: false,
          usageCount: 0,
          quest: {
            title: quest.title,
            description: quest.description,
            objectives: quest.objectives,
            type: quest.type,
            privacy: quest.privacy,
            priority: quest.priority,
            difficulty: quest.difficulty,
            estimatedTime: quest.estimatedTime,
            tags: quest.tags,
            dependencies: [],
            isRecurring: quest.isRecurring,
            recurringPattern: quest.recurringPattern,
            xpReward: quest.xpReward,
            isTemplate: true,
          },
        };
        
        return { templates: [...state.templates, template] };
      }),
      
      useTemplate: (templateId) => set((state) => {
        const template = state.templates.find(t => t.id === templateId);
        if (!template) return state;
        
        const newQuest: Quest = {
          ...template.quest,
          id: Date.now().toString(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          order: state.quests.length,
          status: 'not_started',
          progress: 0,
          completed: false,
          actualTime: 0,
          timeEntries: [],
          comments: [],
          completedCount: 0,
          streak: 0,
          isTemplate: false,
        };
        
        return { 
          quests: [...state.quests, newQuest],
          templates: state.templates.map(t => 
            t.id === templateId 
              ? { ...t, usageCount: t.usageCount + 1 }
              : t
          )
        };
      }),
      
      deleteTemplate: (id) => set((state) => ({
        templates: state.templates.filter(template => template.id !== id),
      })),
      
      updateUserStats: () => set((state) => {
        const completedQuests = state.quests.filter(q => q.completed);
        const totalQuests = state.quests.length;
        const totalTimeSpent = state.quests.reduce((sum, q) => sum + q.actualTime, 0);
        
        const newStats: UserStats = {
          ...state.userStats,
          totalQuestsCompleted: completedQuests.length,
          totalTimeSpent,
          averageCompletionTime: completedQuests.length > 0 
            ? totalTimeSpent / completedQuests.length 
            : 0,
          completionRate: totalQuests > 0 ? (completedQuests.length / totalQuests) * 100 : 0,
        };
        
        return { userStats: newStats };
      }),
      
      unlockAchievement: (achievementId) => set((state) => {
        const achievement = state.userStats.achievements.find(a => a.id === achievementId);
        if (!achievement || achievement.unlockedAt) return state;
        
        // Generate achievement notification
        setTimeout(() => {
          const notificationStore = require('@/store/notificationStore').default;
          if (notificationStore.getState) {
            notificationStore.getState().addNotification({
              type: 'achievement',
              priority: 'high',
              title: 'Achievement Unlocked!',
              message: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
              achievementId: achievement.id,
            });
          }
        }, 100);
        
        return {
          userStats: {
            ...state.userStats,
            achievements: state.userStats.achievements.map(a =>
              a.id === achievementId
                ? { ...a, unlockedAt: Date.now() }
                : a
            ),
            totalXP: state.userStats.totalXP + achievement.xpReward,
          }
        };
      }),
      
      searchQuests: (query) => {
        const state = get();
        const lowercaseQuery = query.toLowerCase();
        
        return state.quests.filter(quest =>
          quest.title.toLowerCase().includes(lowercaseQuery) ||
          quest.description.toLowerCase().includes(lowercaseQuery) ||
          quest.objectives.some(obj => obj.toLowerCase().includes(lowercaseQuery)) ||
          quest.tags.some(tag => tag.name.toLowerCase().includes(lowercaseQuery))
        );
      },
      
      filterQuests: (filters) => {
        const state = get();
        
        return state.quests.filter(quest => {
          if (filters.type && !filters.type.includes(quest.type)) return false;
          if (filters.status && !filters.status.includes(quest.status)) return false;
          if (filters.priority && !filters.priority.includes(quest.priority)) return false;
          if (filters.difficulty && !filters.difficulty.includes(quest.difficulty)) return false;
          
          if (filters.tags && filters.tags.length > 0) {
            const questTagIds = quest.tags.map(tag => tag.id);
            if (!filters.tags.some(tagId => questTagIds.includes(tagId))) return false;
          }
          
          if (filters.dateRange) {
            if (quest.createdAt < filters.dateRange.start || quest.createdAt > filters.dateRange.end) {
              return false;
            }
          }
          
          if (filters.dueDateRange && quest.dueDate) {
            if (quest.dueDate < filters.dueDateRange.start || quest.dueDate > filters.dueDateRange.end) {
              return false;
            }
          }
          
          if (filters.hasTimeEntries !== undefined) {
            const hasTimeEntries = quest.timeEntries.length > 0;
            if (filters.hasTimeEntries !== hasTimeEntries) return false;
          }
          
          if (filters.isOverdue && quest.dueDate) {
            const isOverdue = quest.dueDate < Date.now() && !quest.completed;
            if (!isOverdue) return false;
          }
          
          return true;
        });
      },
    }),
    {
      name: 'quest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useQuestStore;