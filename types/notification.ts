export type NotificationType = 'due_soon' | 'overdue' | 'achievement' | 'streak' | 'recurring' | 'completion';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  questId?: string;
  achievementId?: string;
  createdAt: number;
  readAt?: number;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  
  // CRUD operations
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  
  // Getters
  getUnreadNotifications: () => Notification[];
  getNotificationsByType: (type: NotificationType) => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
  
  // Auto-generation
  generateQuestNotifications: () => void;
  generateAchievementNotifications: () => void;
}