import { useEffect, useRef } from 'react';
import useTimerStore from '@/store/timerStore';
import { Platform } from 'react-native';

export function useTimer() {
  const { 
    currentSession, 
    timerState, 
    remainingTime,
    stopTimer,
    settings 
  } = useTimerStore();
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (timerState === 'running' && currentSession) {
      intervalRef.current = setInterval(() => {
        const elapsed = Date.now() - currentSession.startTime - currentSession.totalPausedDuration;
        const remaining = Math.max(0, (currentSession.duration * 60 * 1000) - elapsed);
        
        // Auto-complete timer when time runs out
        if (remaining <= 0) {
          stopTimer(true);
          
          // Handle notifications and sounds
          if (settings.showNotifications) {
            // Show notification (would need expo-notifications for full implementation)
            console.log('Timer completed!');
          }
          
          // Handle vibration on mobile
          if (settings.vibrationEnabled && Platform.OS !== 'web') {
            // Would use expo-haptics here
            console.log('Vibrate');
          }
          
          // Handle sound
          if (settings.soundEnabled) {
            // Would use expo-av here
            console.log('Play sound');
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timerState, currentSession, stopTimer, settings]);
  
  return {
    currentSession,
    timerState,
    remainingTime,
    isActive: timerState === 'running' || timerState === 'paused'
  };
}

export default useTimer;