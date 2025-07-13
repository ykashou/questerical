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

// Sandbox mode sample data
const generateSandboxData = () => {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  const sampleTags: QuestTag[] = [
    { id: 'work', name: 'Work', color: '#5E81AC' },
    { id: 'personal', name: 'Personal', color: '#A3BE8C' },
    { id: 'health', name: 'Health', color: '#BF616A' },
    { id: 'learning', name: 'Learning', color: '#EBCB8B' },
    { id: 'creative', name: 'Creative', color: '#B48EAD' },
    { id: 'finance', name: 'Finance', color: '#88C0D0' },
    { id: 'social', name: 'Social', color: '#D08770' },
  ];
  
  const sampleQuests: Quest[] = [
    {
      id: 'sandbox-1',
      title: 'Complete Project Proposal',
      description: 'Draft and finalize the Q1 project proposal for the new mobile app initiative.',
      objectives: [
        'Research market requirements',
        'Define project scope and timeline',
        'Create budget estimation',
        'Present to stakeholders'
      ],
      type: 'main',
      privacy: 'private',
      priority: 'high',
      difficulty: 'hard',
      status: 'in_progress',
      progress: 65,
      completed: false,
      createdAt: now - (5 * dayMs),
      updatedAt: now - dayMs,
      dueDate: now + (3 * dayMs),
      estimatedTime: 480,
      actualTime: 312,
      order: 0,
      tags: [sampleTags[0], sampleTags[3]],
      dependencies: [],
      timeEntries: [
        {
          id: 'time-1',
          startTime: now - (4 * dayMs),
          endTime: now - (4 * dayMs) + (2 * 60 * 60 * 1000),
          duration: 120,
          description: 'Initial research and planning'
        },
        {
          id: 'time-2',
          startTime: now - (2 * dayMs),
          endTime: now - (2 * dayMs) + (3.2 * 60 * 60 * 1000),
          duration: 192,
          description: 'Drafting proposal document'
        }
      ],
      comments: [
        {
          id: 'comment-1',
          text: 'Need to include more detailed timeline breakdown',
          createdAt: now - (2 * dayMs),
          updatedAt: now - (2 * dayMs)
        }
      ],
      isRecurring: false,
      completedCount: 0,
      streak: 0,
      xpReward: 100,
      isTemplate: false,
    },
    {
      id: 'sandbox-2',
      title: 'Daily Workout Routine',
      description: 'Maintain consistent daily exercise routine for better health and energy.',
      objectives: [
        '30 minutes cardio',
        '20 minutes strength training',
        '10 minutes stretching'
      ],
      type: 'side',
      privacy: 'private',
      priority: 'medium',
      difficulty: 'medium',
      status: 'completed',
      progress: 100,
      completed: true,
      createdAt: now - (30 * dayMs),
      updatedAt: now - (6 * 60 * 60 * 1000),
      estimatedTime: 60,
      actualTime: 55,
      order: 1,
      tags: [sampleTags[2]],
      dependencies: [],
      timeEntries: [
        {
          id: 'time-3',
          startTime: now - (6 * 60 * 60 * 1000),
          endTime: now - (5 * 60 * 60 * 1000),
          duration: 55,
          description: 'Morning workout session'
        }
      ],
      comments: [],
      isRecurring: true,
      recurringPattern: {
        type: 'daily',
        interval: 1
      },
      completedCount: 15,
      streak: 7,
      xpReward: 50,
      isTemplate: false,
    },
    {
      id: 'sandbox-3',
      title: 'Learn React Native Animations',
      description: 'Master advanced animation techniques in React Native for better UX.',
      objectives: [
        'Study Reanimated 3 documentation',
        'Build sample animation components',
        'Create smooth transitions',
        'Optimize performance'
      ],
      type: 'side',
      privacy: 'public',
      priority: 'medium',
      difficulty: 'hard',
      status: 'not_started',
      progress: 0,
      completed: false,
      createdAt: now - dayMs,
      updatedAt: now - dayMs,
      dueDate: now + (14 * dayMs),
      estimatedTime: 720,
      actualTime: 0,
      order: 2,
      tags: [sampleTags[3], sampleTags[4]],
      dependencies: [],
      timeEntries: [],
      comments: [],
      isRecurring: false,
      completedCount: 0,
      streak: 0,
      xpReward: 50,
      isTemplate: false,
    },
    {
      id: 'sandbox-4',
      title: 'Organize Digital Photos',
      description: 'Sort and organize years of accumulated digital photos into proper folders.',
      objectives: [
        'Delete duplicate photos',
        'Create year-based folders',
        'Tag important memories',
        'Backup to cloud storage'
      ],
      type: 'mini',
      privacy: 'private',
      priority: 'low',
      difficulty: 'easy',
      status: 'paused',
      progress: 25,
      completed: false,
      createdAt: now - (10 * dayMs),
      updatedAt: now - (3 * dayMs),
      estimatedTime: 180,
      actualTime: 45,
      order: 3,
      tags: [sampleTags[1]],
      dependencies: [],
      timeEntries: [
        {
          id: 'time-4',
          startTime: now - (3 * dayMs),
          endTime: now - (3 * dayMs) + (45 * 60 * 1000),
          duration: 45,
          description: 'Started sorting 2023 photos'
        }
      ],
      comments: [
        {
          id: 'comment-2',
          text: 'Found some great vacation photos from last summer!',
          createdAt: now - (3 * dayMs),
          updatedAt: now - (3 * dayMs)
        }
      ],
      isRecurring: false,
      completedCount: 0,
      streak: 0,
      xpReward: 25,
      isTemplate: false,
    },
    {
      id: 'sandbox-5',
      title: 'Monthly Budget Review',
      description: 'Analyze spending patterns and adjust budget for next month.',
      objectives: [
        'Review all expenses',
        'Categorize spending',
        'Identify savings opportunities',
        'Set next month goals'
      ],
      type: 'main',
      privacy: 'private',
      priority: 'high',
      difficulty: 'medium',
      status: 'completed',
      progress: 100,
      completed: true,
      createdAt: now - (7 * dayMs),
      updatedAt: now - (2 * dayMs),
      estimatedTime: 120,
      actualTime: 95,
      order: 4,
      tags: [sampleTags[5]],
      dependencies: [],
      timeEntries: [
        {
          id: 'time-5',
          startTime: now - (2 * dayMs),
          endTime: now - (2 * dayMs) + (95 * 60 * 1000),
          duration: 95,
          description: 'Complete budget analysis'
        }
      ],
      comments: [],
      isRecurring: true,
      recurringPattern: {
        type: 'monthly',
        interval: 1
      },
      completedCount: 3,
      streak: 3,
      xpReward: 100,
      isTemplate: false,
    },
    {
      id: 'sandbox-6',
      title: 'Call Mom',
      description: 'Weekly check-in call with family.',
      objectives: [
        'Catch up on family news',
        'Share weekly updates',
        'Plan upcoming visit'
      ],
      type: 'mini',
      privacy: 'private',
      priority: 'medium',
      difficulty: 'easy',
      status: 'not_started',
      progress: 0,
      completed: false,
      createdAt: now - (2 * dayMs),
      updatedAt: now - (2 * dayMs),
      dueDate: now + dayMs,
      estimatedTime: 30,
      actualTime: 0,
      order: 5,
      tags: [sampleTags[6]],
      dependencies: [],
      timeEntries: [],
      comments: [],
      isRecurring: true,
      recurringPattern: {
        type: 'weekly',
        interval: 1
      },
      completedCount: 8,
      streak: 4,
      xpReward: 25,
      isTemplate: false,
    }
  ];
  
  const sampleStats: UserStats = {
    totalXP: 1250,
    level: 2,
    currentStreak: 7,
    longestStreak: 12,
    totalQuestsCompleted: 18,
    totalTimeSpent: 507,
    averageCompletionTime: 28,
    completionRate: 75,
    achievements: [
      {
        ...defaultAchievements[0],
        progress: 1,
        unlockedAt: now - (20 * dayMs)
      },
      {
        ...defaultAchievements[1],
        progress: 7,
        unlockedAt: now - (5 * dayMs)
      },
      {
        ...defaultAchievements[2],
        progress: 18
      },
      {
        ...defaultAchievements[3],
        progress: 507
      }
    ]
  };
  
  return {
    quests: sampleQuests,
    tags: sampleTags,
    userStats: sampleStats
  };
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
      
      // Sandbox mode
      isSandboxMode: false,
      originalData: null,
      
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
      
      // Sandbox mode
      enableSandboxMode: () => set((state) => {
        if (state.isSandboxMode) return state;
        
        // Store original data
        const originalData = {
          quests: state.quests,
          tags: state.tags,
          userStats: state.userStats,
          templates: state.templates
        };
        
        // Load sandbox data
        const sandboxData = generateSandboxData();
        
        return {
          ...state,
          isSandboxMode: true,
          originalData,
          quests: sandboxData.quests,
          tags: sandboxData.tags,
          userStats: sandboxData.userStats
        };
      }),
      
      disableSandboxMode: () => set((state) => {
        if (!state.isSandboxMode || !state.originalData) return state;
        
        // Restore original data
        return {
          ...state,
          isSandboxMode: false,
          quests: state.originalData.quests,
          tags: state.originalData.tags,
          userStats: state.originalData.userStats,
          templates: state.originalData.templates,
          originalData: null
        };
      }),
    }),
    {
      name: 'quest-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useQuestStore;