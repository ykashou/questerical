export type QuestType = 'main' | 'side' | 'mini';
export type PrivacyType = 'private' | 'shared' | 'public';
export type PriorityType = 'low' | 'medium' | 'high' | 'critical';
export type DifficultyType = 'easy' | 'medium' | 'hard' | 'expert';
export type QuestStatus = 'not_started' | 'in_progress' | 'completed' | 'paused' | 'cancelled';

export interface QuestTag {
  id: string;
  name: string;
  color: string;
}

export interface QuestDependency {
  questId: string;
  type: 'blocks' | 'requires';
}

export interface TimeEntry {
  id: string;
  startTime: number;
  endTime?: number;
  duration: number; // in minutes
  description?: string;
}

export interface QuestComment {
  id: string;
  text: string;
  createdAt: number;
  updatedAt: number;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  type: QuestType;
  privacy: PrivacyType;
  priority: PriorityType;
  difficulty: DifficultyType;
  status: QuestStatus;
  progress: number; // 0-100
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  dueDate?: number;
  estimatedTime?: number; // in minutes
  actualTime: number; // in minutes
  order?: number;
  tags: QuestTag[];
  dependencies: QuestDependency[];
  timeEntries: TimeEntry[];
  comments: QuestComment[];
  isRecurring: boolean;
  recurringPattern?: {
    type: 'daily' | 'weekly' | 'monthly';
    interval: number;
    endDate?: number;
  };
  completedCount: number; // for recurring quests
  streak: number;
  xpReward: number;
  isTemplate: boolean;
  templateId?: string;
}

export interface QuestTemplate {
  id: string;
  name: string;
  description: string;
  quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'status' | 'progress' | 'actualTime' | 'timeEntries' | 'comments' | 'completedCount' | 'streak'>;
  category: string;
  isPublic: boolean;
  usageCount: number;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalQuestsCompleted: number;
  totalTimeSpent: number; // in minutes
  averageCompletionTime: number;
  completionRate: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  xpReward: number;
}

export interface QuestStore {
  quests: Quest[];
  templates: QuestTemplate[];
  tags: QuestTag[];
  userStats: UserStats;
  
  // Quest CRUD
  addQuest: (quest: Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuest: (id: string, updates: Partial<Omit<Quest, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteQuest: (id: string) => void;
  duplicateQuest: (id: string) => void;
  
  // Quest status management
  toggleQuestCompletion: (id: string) => void;
  updateQuestStatus: (id: string, status: QuestStatus) => void;
  updateQuestProgress: (id: string, progress: number) => void;
  updateQuestPrivacy: (id: string, privacy: PrivacyType) => void;
  
  // Quest organization
  reorderQuests: (quests: Quest[]) => void;
  bulkUpdateQuests: (questIds: string[], updates: Partial<Quest>) => void;
  bulkDeleteQuests: (questIds: string[]) => void;
  
  // Time tracking
  startTimeTracking: (questId: string) => void;
  stopTimeTracking: (questId: string, description?: string) => void;
  addTimeEntry: (questId: string, entry: Omit<TimeEntry, 'id'>) => void;
  
  // Comments
  addComment: (questId: string, text: string) => void;
  updateComment: (questId: string, commentId: string, text: string) => void;
  deleteComment: (questId: string, commentId: string) => void;
  
  // Tags
  addTag: (tag: Omit<QuestTag, 'id'>) => void;
  updateTag: (id: string, updates: Partial<QuestTag>) => void;
  deleteTag: (id: string) => void;
  
  // Templates
  createTemplate: (quest: Quest, name: string, category: string) => void;
  useTemplate: (templateId: string) => void;
  deleteTemplate: (id: string) => void;
  
  // Analytics
  updateUserStats: () => void;
  unlockAchievement: (achievementId: string) => void;
  
  // Search and filter
  searchQuests: (query: string) => Quest[];
  filterQuests: (filters: QuestFilters) => Quest[];
}

export interface QuestFilters {
  type?: QuestType[];
  status?: QuestStatus[];
  priority?: PriorityType[];
  difficulty?: DifficultyType[];
  tags?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  dueDateRange?: {
    start: number;
    end: number;
  };
  hasTimeEntries?: boolean;
  isOverdue?: boolean;
}