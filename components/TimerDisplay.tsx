import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Play, Pause, Square, RotateCcw } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';

interface TimerDisplayProps {
  questId?: string;
  compact?: boolean;
  horizontal?: boolean;
}

export default function TimerDisplay({ questId, compact = false, horizontal = false }: TimerDisplayProps) {
  const { colors } = useThemeStore();
  const { 
    currentSession,
    timerState,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
    formatTime
  } = useTimerStore();
  
  const [displayTime, setDisplayTime] = useState(0);
  
  useEffect(() => {
    if (timerState === 'running' && currentSession) {
      const updateTime = () => {
        const elapsed = Date.now() - currentSession.startTime - currentSession.totalPausedDuration;
        const remaining = Math.max(0, (currentSession.duration * 60 * 1000) - elapsed);
        setDisplayTime(remaining);
      };
      
      updateTime();
      const interval = setInterval(updateTime, 1000);
      
      return () => clearInterval(interval);
    } else if (currentSession) {
      const elapsed = Date.now() - currentSession.startTime - currentSession.totalPausedDuration;
      const remaining = Math.max(0, (currentSession.duration * 60 * 1000) - elapsed);
      setDisplayTime(remaining);
    } else {
      setDisplayTime(0);
    }
  }, [timerState, currentSession]);
  
  const handleStartTimer = () => {
    if (questId) {
      startTimer('focus', 25, questId);
    } else {
      startTimer('pomodoro');
    }
  };
  
  const handlePlayPause = () => {
    if (timerState === 'running') {
      pauseTimer();
    } else if (timerState === 'paused') {
      resumeTimer();
    } else {
      handleStartTimer();
    }
  };
  
  const handleStop = () => {
    stopTimer(false);
  };
  
  const handleReset = () => {
    resetTimer();
  };
  
  if (compact && !currentSession) {
    return null;
  }
  
  const isActive = currentSession && (timerState === 'running' || timerState === 'paused');
  const progress = currentSession 
    ? Math.max(0, Math.min(1, 1 - (displayTime / (currentSession.duration * 60 * 1000))))
    : 0;
  
  // Horizontal compact timer bar for quest cards
  if (horizontal) {
    if (!currentSession || (currentSession.questId !== questId)) {
      return null;
    }
    
    return (
      <View style={[styles.horizontalContainer, { backgroundColor: colors.border + '40' }]}>
        <View style={styles.horizontalContent}>
          <TouchableOpacity
            style={styles.horizontalPlayButton}
            onPress={handlePlayPause}
            activeOpacity={0.7}
          >
            {timerState === 'running' ? (
              <Pause size={12} color={colors.primary} />
            ) : (
              <Play size={12} color={colors.primary} />
            )}
          </TouchableOpacity>
          
          <View style={styles.horizontalTimerInfo}>
            <Text style={[styles.horizontalTimeText, { color: colors.text }]}>
              {formatTime(displayTime)}
            </Text>
            <Text style={[styles.horizontalModeText, { color: colors.textSecondary }]}>
              {currentSession.mode} • {currentSession.duration}m
            </Text>
          </View>
          
          <View style={styles.horizontalProgressContainer}>
            <View style={[styles.horizontalProgressBar, { backgroundColor: colors.border }]}>
              <View 
                style={[
                  styles.horizontalProgressFill, 
                  { 
                    backgroundColor: timerState === 'running' ? colors.primary : colors.warning,
                    width: `${progress * 100}%`
                  }
                ]} 
              />
            </View>
          </View>
          
          {isActive && (
            <TouchableOpacity
              style={styles.horizontalStopButton}
              onPress={handleStop}
              activeOpacity={0.7}
            >
              <Square size={10} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
  
  return (
    <View style={[
      styles.container, 
      { backgroundColor: colors.card, borderColor: colors.border },
      compact && styles.compactContainer
    ]}>
      {!compact && (
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {currentSession ? `${currentSession.mode.charAt(0).toUpperCase() + currentSession.mode.slice(1)} Timer` : 'Timer'}
          </Text>
          {currentSession && (
            <Text style={[styles.duration, { color: colors.textSecondary }]}>
              {currentSession.duration} min
            </Text>
          )}
        </View>
      )}
      
      <View style={styles.timerSection}>
        <View style={[styles.progressRing, { borderColor: colors.border }]}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.primary,
                transform: [{ rotate: `${progress * 360}deg` }]
              }
            ]} 
          />
          <View style={[styles.timerDisplay, { backgroundColor: colors.card }]}>
            <Text style={[styles.timeText, { color: colors.text }]}>
              {formatTime(displayTime)}
            </Text>
            {currentSession && timerState === 'paused' && (
              <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                Paused
              </Text>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: colors.primary }]}
          onPress={handlePlayPause}
          activeOpacity={0.7}
        >
          {timerState === 'running' ? (
            <Pause size={20} color={colors.background} />
          ) : (
            <Play size={20} color={colors.background} />
          )}
        </TouchableOpacity>
        
        {isActive && (
          <>
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.danger }]}
              onPress={handleStop}
              activeOpacity={0.7}
            >
              <Square size={20} color={colors.background} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.controlButton, { backgroundColor: colors.textSecondary }]}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <RotateCcw size={20} color={colors.background} />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  compactContainer: {
    padding: 12,
    gap: 8,
  },
  header: {
    alignItems: 'center',
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  duration: {
    fontSize: 14,
  },
  timerSection: {
    alignItems: 'center',
  },
  progressRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    right: '50%',
    transformOrigin: 'right center',
  },
  timerDisplay: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  timeText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Horizontal timer bar styles
  horizontalContainer: {
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  horizontalContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalPlayButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalTimerInfo: {
    flex: 1,
  },
  horizontalTimeText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  horizontalModeText: {
    fontSize: 10,
    textTransform: 'capitalize',
  },
  horizontalProgressContainer: {
    flex: 2,
    marginHorizontal: 8,
  },
  horizontalProgressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  horizontalProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  horizontalStopButton: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});