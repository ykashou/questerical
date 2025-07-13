import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationStore, NotificationType, NotificationPriority } from '@/types/notification';

const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => set((state) => {
        const newNotification: Notification = {
          ...notification,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: Date.now(),
        };
        
        const updatedNotifications = [newNotification, ...state.notifications];
        const unreadCount = updatedNotifications.filter(n => !n.readAt).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),
      
      markAsRead: (id) => set((state) => {
        const updatedNotifications = state.notifications.map(notification =>
          notification.id === id
            ? { ...notification, readAt: Date.now() }
            : notification
        );
        
        const unreadCount = updatedNotifications.filter(n => !n.readAt).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),
      
      markAllAsRead: () => set((state) => {
        const updatedNotifications = state.notifications.map(notification => ({
          ...notification,
          readAt: notification.readAt || Date.now(),
        }));
        
        return {
          notifications: updatedNotifications,
          unreadCount: 0,
        };
      }),
      
      deleteNotification: (id) => set((state) => {
        const updatedNotifications = state.notifications.filter(n => n.id !== id);
        const unreadCount = updatedNotifications.filter(n => !n.readAt).length;
        
        return {
          notifications: updatedNotifications,
          unreadCount,
        };
      }),
      
      clearAllNotifications: () => set({
        notifications: [],
        unreadCount: 0,
      }),
      
      getUnreadNotifications: () => {
        const state = get();
        return state.notifications.filter(n => !n.readAt);
      },
      
      getNotificationsByType: (type: NotificationType) => {
        const state = get();
        return state.notifications.filter(n => n.type === type);
      },
      
      getNotificationsByPriority: (priority: NotificationPriority) => {
        const state = get();
        return state.notifications.filter(n => n.priority === priority);
      },
      
      generateQuestNotifications: () => {
        // This will be called from quest store when quests change
        // Implementation will be added when integrating with quest store
      },
      
      generateAchievementNotifications: () => {
        // This will be called when achievements are unlocked
        // Implementation will be added when integrating with quest store
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useNotificationStore;