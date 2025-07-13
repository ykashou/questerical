import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Quest, TimeEntry } from '@/types/quest';

export type TimerMode = 'pomodoro' | 'focus' | 'break' | 'custom';
export type TimerState = 'idle' | 'running' | 'paused' | 'completed';

export interface TimerSession {
  id: string;
  questId?: string;
  mode: TimerMode;
  duration: number; // in minutes
  startTime: number;
  endTime?: number;
  pausedTime?: number;
  totalPausedDuration: number; // in milliseconds
  completed: boolean;
  description?: string;
}

export interface TimerSettings {
  pomodoroDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number; // after how many pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  showNotifications: boolean;
}

export interface FocusMode {
  isActive: boolean;
  startTime?: number;
  questIds: string[];
  hideDistractions: boolean;
  blockNotifications: boolean;
  customMessage?: string;
}

interface TimerStore {
  // Current timer state
  currentSession: TimerSession | null;
  timerState: TimerState;
  remainingTime: number; // in milliseconds
  
  // Timer settings
  settings: TimerSettings;
  
  // Focus mode
  focusMode: FocusMode;
  
  // Session history
  sessions: TimerSession[];
  
  // Actions
  startTimer: (mode: TimerMode, duration?: number, questId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (completed?: boolean) => void;
  resetTimer: () => void;
  
  // Settings
  updateSettings: (settings: Partial<TimerSettings>) => void;
  
  // Focus mode
  enableFocusMode: (questIds?: string[], options?: Partial<FocusMode>) => void;
  disableFocusMode: () => void;
  updateFocusMode: (updates: Partial<FocusMode>) => void;
  
  // Session management
  getSessionHistory: () => TimerSession[];
  clearSessionHistory: () => void;
  
  // Utility
  formatTime: (milliseconds: number) => string;
  getActiveQuest: () => string | null;
}

const defaultSettings: TimerSettings = {
  pomodoroDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  vibrationEnabled: true,
  showNotifications: true,
};

const defaultFocusMode: FocusMode = {
  isActive: false,
  questIds: [],
  hideDistractions: true,
  blockNotifications: false,
};

const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      currentSession: null,
      timerState: 'idle',
      remainingTime: 0,
      settings: defaultSettings,
      focusMode: defaultFocusMode,
      sessions: [],
      
      startTimer: (mode: TimerMode, duration?: number, questId?: string) => {
        const state = get();
        let timerDuration: number;
        
        switch (mode) {
          case 'pomodoro':
            timerDuration = state.settings.pomodoroDuration;
            break;
          case 'focus':
            timerDuration = duration || 60; // Default 1 hour for focus sessions
            break;
          case 'break':
            timerDuration = state.settings.shortBreakDuration;
            break;
          case 'custom':
            timerDuration = duration || 25;
            break;
          default:
            timerDuration = 25;
        }
        
        const newSession: TimerSession = {
          id: Date.now().toString(),
          questId,
          mode,
          duration: timerDuration,
          startTime: Date.now(),
          totalPausedDuration: 0,
          completed: false,
        };
        
        set({
          currentSession: newSession,
          timerState: 'running',
          remainingTime: timerDuration * 60 * 1000, // Convert to milliseconds
        });
        
        // Start time tracking for quest if provided
        if (questId) {
          const questStore = require('@/store/questStore').default;
          if (questStore.getState) {
            questStore.getState().startTimeTracking(questId);
          }
        }
      },
      
      pauseTimer: () => {
        const state = get();
        if (state.timerState !== 'running' || !state.currentSession) return;
        
        set({
          timerState: 'paused',
          currentSession: {
            ...state.currentSession,
            pausedTime: Date.now(),
          },
        });
      },
      
      resumeTimer: () => {
        const state = get();
        if (state.timerState !== 'paused' || !state.currentSession) return;
        
        const pausedDuration = state.currentSession.pausedTime 
          ? Date.now() - state.currentSession.pausedTime 
          : 0;
        
        set({
          timerState: 'running',
          currentSession: {
            ...state.currentSession,
            pausedTime: undefined,
            totalPausedDuration: state.currentSession.totalPausedDuration + pausedDuration,
          },
        });
      },
      
      stopTimer: (completed = false) => {
        const state = get();
        if (!state.currentSession) return;
        
        const endTime = Date.now();
        const completedSession: TimerSession = {
          ...state.currentSession,
          endTime,
          completed,
        };
        
        // Stop time tracking for quest if active
        if (state.currentSession.questId) {
          const questStore = require('@/store/questStore').default;
          if (questStore.getState) {
            const actualDuration = Math.round(
              (endTime - state.currentSession.startTime - state.currentSession.totalPausedDuration) / 60000
            );
            questStore.getState().stopTimeTracking(
              state.currentSession.questId,
              `${state.currentSession.mode} session - ${actualDuration} minutes`
            );
          }
        }
        
        set({
          currentSession: null,
          timerState: 'idle',
          remainingTime: 0,
          sessions: [...state.sessions, completedSession],
        });
        
        // Generate completion notification if completed
        if (completed) {
          setTimeout(() => {
            const notificationStore = require('@/store/notificationStore').default;
            if (notificationStore.getState) {
              notificationStore.getState().addNotification({
                type: 'timer',
                priority: 'medium',
                title: 'Timer Completed!',
                message: `Your ${completedSession.mode} session of ${completedSession.duration} minutes is complete.`,
                questId: completedSession.questId,
              });
            }
          }, 100);
        }
      },
      
      resetTimer: () => {
        const state = get();
        if (state.currentSession?.questId) {
          // Stop time tracking without saving if timer is reset
          const questStore = require('@/store/questStore').default;
          if (questStore.getState) {
            const quest = questStore.getState().quests.find((q: Quest) => q.id === state.currentSession?.questId);
            if (quest) {
              const activeEntry = quest.timeEntries.find((entry: TimeEntry) => !entry.endTime);
              if (activeEntry) {
                // Remove the active time entry since timer was reset
                questStore.getState().updateQuest(quest.id, {
                  timeEntries: quest.timeEntries.filter((entry: TimeEntry) => entry.id !== activeEntry.id)
                });
              }
            }
          }
        }
        
        set({
          currentSession: null,
          timerState: 'idle',
          remainingTime: 0,
        });
      },
      
      updateSettings: (newSettings: Partial<TimerSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },
      
      enableFocusMode: (questIds = [], options = {}) => {
        set({
          focusMode: {
            ...defaultFocusMode,
            ...options,
            isActive: true,
            startTime: Date.now(),
            questIds,
          },
        });
        
        // Generate focus mode notification
        setTimeout(() => {
          const notificationStore = require('@/store/notificationStore').default;
          if (notificationStore.getState) {
            notificationStore.getState().addNotification({
              type: 'focus',
              priority: 'low',
              title: 'Focus Mode Activated',
              message: questIds.length > 0 
                ? `Focus mode enabled for ${questIds.length} quest(s). Stay focused!`
                : 'Focus mode enabled. Minimize distractions and stay productive!',
            });
          }
        }, 100);
      },
      
      disableFocusMode: () => {
        const state = get();
        const duration = state.focusMode.startTime 
          ? Math.round((Date.now() - state.focusMode.startTime) / 60000)
          : 0;
        
        set({
          focusMode: defaultFocusMode,
        });
        
        // Generate focus mode completion notification
        if (duration > 0) {
          setTimeout(() => {
            const notificationStore = require('@/store/notificationStore').default;
            if (notificationStore.getState) {
              notificationStore.getState().addNotification({
                type: 'focus',
                priority: 'low',
                title: 'Focus Session Complete',
                message: `Great job! You stayed focused for ${duration} minutes.`,
              });
            }
          }, 100);
        }
      },
      
      updateFocusMode: (updates: Partial<FocusMode>) => {
        set((state) => ({
          focusMode: { ...state.focusMode, ...updates },
        }));
      },
      
      getSessionHistory: () => {
        return get().sessions;
      },
      
      clearSessionHistory: () => {
        set({ sessions: [] });
      },
      
      formatTime: (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      },
      
      getActiveQuest: () => {
        const state = get();
        return state.currentSession?.questId || null;
      },
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useTimerStore;