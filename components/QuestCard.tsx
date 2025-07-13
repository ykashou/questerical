import React, { useRef, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Pressable, Animated, PanResponder, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  CheckCircle, 
  Circle, 
  Lock, 
  Users, 
  Globe, 
  Archive, 
  Clock, 
  Play, 
  Pause, 
  AlertTriangle,
  Star,
  Calendar,
  Timer,
  Target,
  Zap
} from 'lucide-react-native';
import { Quest, PriorityType } from '@/types/quest';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';

interface QuestCardProps {
  quest: Quest;
  isSelected?: boolean;
  onSelect?: (questId: string) => void;
  showTimeTracking?: boolean;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

export default function QuestCard({ quest, isSelected, onSelect, showTimeTracking = true }: QuestCardProps) {
  const router = useRouter();
  const { 
    toggleQuestCompletion, 
    startTimeTracking, 
    stopTimeTracking, 
    updateQuestProgress 
  } = useQuestStore();
  const { colors } = useThemeStore();
  const [isArchived, setIsArchived] = useState(false);

  const position = useRef(new Animated.Value(0)).current;
  
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        position.setValue(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Swiping right (complete)
        if (gestureState.dx > SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            toggleQuestCompletion(quest.id);
            position.setValue(0);
          });
        } 
        // Swiping left (archive)
        else if (gestureState.dx < -SWIPE_THRESHOLD) {
          Animated.timing(position, {
            toValue: -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            setIsArchived(true);
            setTimeout(() => {
              setIsArchived(false);
              position.setValue(0);
            }, 500);
          });
        } 
        // Not enough to trigger action, reset position
        else {
          Animated.spring(position, {
            toValue: 0,
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handlePress = () => {
    if (onSelect) {
      onSelect(quest.id);
    } else {
      router.push(`/quest/${quest.id}`);
    }
  };

  const handleToggleCompletion = (e: any) => {
    e.stopPropagation();
    toggleQuestCompletion(quest.id);
  };

  const handleTimeTracking = (e: any) => {
    e.stopPropagation();
    const hasActiveEntry = quest.timeEntries.some(entry => !entry.endTime);
    
    if (hasActiveEntry) {
      stopTimeTracking(quest.id);
    } else {
      startTimeTracking(quest.id);
    }
  };

  const handleProgressUpdate = (e: any) => {
    e.stopPropagation();
    const newProgress = quest.progress >= 100 ? 0 : quest.progress + 25;
    updateQuestProgress(quest.id, newProgress);
  };

  const getPrivacyIcon = () => {
    switch (quest.privacy) {
      case 'private':
        return <Lock size={14} color={colors.privacyTypes.private} />;
      case 'shared':
        return <Users size={14} color={colors.privacyTypes.shared} />;
      case 'public':
        return <Globe size={14} color={colors.privacyTypes.public} />;
    }
  };

  const getPriorityIcon = () => {
    switch (quest.priority) {
      case 'critical':
        return <AlertTriangle size={14} color={colors.danger} />;
      case 'high':
        return <Star size={14} color={colors.warning} />;
      case 'medium':
        return <Target size={14} color={colors.primary} />;
      case 'low':
        return <Circle size={14} color={colors.textSecondary} />;
    }
  };

  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'expert': return colors.danger;
      case 'hard': return colors.warning;
      case 'medium': return colors.primary;
      case 'easy': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const isOverdue = quest.dueDate && quest.dueDate < Date.now() && !quest.completed;
  const hasActiveTimeEntry = quest.timeEntries.some(entry => !entry.endTime);
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  // Calculate opacity for the action hints based on swipe position
  const rightActionOpacity = position.interpolate({
    inputRange: [-200, -100, 0],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const leftActionOpacity = position.interpolate({
    inputRange: [0, 100, 200],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  if (isArchived) {
    return null;
  }

  return (
    <View style={styles.cardContainer}>
      {/* Background action indicators */}
      <View style={styles.actionsContainer}>
        <Animated.View 
          style={[
            styles.actionLeft, 
            { backgroundColor: colors.success, opacity: leftActionOpacity }
          ]}
        >
          <CheckCircle size={24} color={colors.text} />
          <Text style={[styles.actionText, { color: colors.text }]}>Complete</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.actionRight, 
            { backgroundColor: colors.accent, opacity: rightActionOpacity }
          ]}
        >
          <Text style={[styles.actionText, { color: colors.text }]}>Archive</Text>
          <Archive size={24} color={colors.text} />
        </Animated.View>
      </View>

      {/* Swipeable card */}
      <Animated.View 
        style={[
          styles.animatedContainer,
          { transform: [{ translateX: position }] }
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          style={[
            styles.container, 
            { 
              backgroundColor: colors.card,
              borderLeftColor: colors.questTypes[quest.type],
              borderColor: isSelected ? colors.primary : 'transparent',
              borderWidth: isSelected ? 2 : 0,
            },
            quest.completed && {
              opacity: 0.7,
              borderLeftColor: colors.success,
            },
            isOverdue && {
              borderColor: colors.danger,
              borderWidth: 1,
            }
          ]} 
          onPress={handlePress}
          activeOpacity={0.7}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <View style={[styles.typeIndicator, { backgroundColor: colors.questTypes[quest.type] }]} />
              <Text style={[styles.title, { color: colors.text }, quest.completed && styles.completedText]} numberOfLines={1}>
                {quest.title}
              </Text>
              {quest.isRecurring && (
                <View style={styles.recurringBadge}>
                  <Text style={[styles.recurringText, { color: colors.text }]}>↻</Text>
                </View>
              )}
            </View>
            <Pressable 
              style={styles.checkButton} 
              onPress={handleToggleCompletion}
              hitSlop={10}
            >
              {quest.completed ? (
                <CheckCircle size={24} color={colors.success} />
              ) : (
                <Circle size={24} color={colors.textSecondary} />
              )}
            </Pressable>
          </View>
          
          {/* Progress Bar */}
          {quest.progress > 0 && quest.progress < 100 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      backgroundColor: colors.primary,
                      width: `${quest.progress}%`
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, { color: colors.textSecondary }]}>
                {quest.progress}%
              </Text>
            </View>
          )}
          
          {/* Description */}
          <Text style={[styles.description, { color: colors.textSecondary }, quest.completed && styles.completedText]} numberOfLines={2}>
            {quest.description}
          </Text>
          
          {/* Tags */}
          {quest.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {quest.tags.slice(0, 3).map((tag) => (
                <View key={tag.id} style={[styles.tag, { backgroundColor: tag.color + '20' }]}>
                  <Text style={[styles.tagText, { color: tag.color }]}>{tag.name}</Text>
                </View>
              ))}
              {quest.tags.length > 3 && (
                <Text style={[styles.moreTagsText, { color: colors.textSecondary }]}>
                  +{quest.tags.length - 3} more
                </Text>
              )}
            </View>
          )}
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.leftFooter}>
              <View style={styles.metaItem}>
                {getPrivacyIcon()}
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {quest.privacy}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                {getPriorityIcon()}
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {quest.priority}
                </Text>
              </View>
              
              <View style={styles.metaItem}>
                <View style={[styles.difficultyDot, { backgroundColor: getDifficultyColor() }]} />
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                  {quest.difficulty}
                </Text>
              </View>
            </View>
            
            <View style={styles.rightFooter}>
              {/* Due Date */}
              {quest.dueDate && (
                <View style={[styles.metaItem, isOverdue && { backgroundColor: colors.danger + '20' }]}>
                  <Calendar size={12} color={isOverdue ? colors.danger : colors.textSecondary} />
                  <Text style={[styles.metaText, { color: isOverdue ? colors.danger : colors.textSecondary }]}>
                    {new Date(quest.dueDate).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {/* Time Tracking */}
              {showTimeTracking && (
                <Pressable 
                  style={[styles.timeButton, hasActiveTimeEntry && { backgroundColor: colors.success + '20' }]}
                  onPress={handleTimeTracking}
                  hitSlop={5}
                >
                  {hasActiveTimeEntry ? (
                    <Pause size={14} color={colors.success} />
                  ) : (
                    <Play size={14} color={colors.textSecondary} />
                  )}
                  {quest.actualTime > 0 && (
                    <Text style={[styles.timeText, { color: colors.textSecondary }]}>
                      {formatTime(quest.actualTime)}
                    </Text>
                  )}
                </Pressable>
              )}
              
              {/* XP Reward */}
              <View style={styles.xpContainer}>
                <Zap size={12} color={colors.warning} />
                <Text style={[styles.xpText, { color: colors.warning }]}>
                  {quest.xpReward}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    width: '100%',
  },
  actionLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 20,
    borderRadius: 12,
  },
  actionRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    borderRadius: 12,
  },
  actionText: {
    fontWeight: '600',
    marginHorizontal: 8,
  },
  animatedContainer: {
    width: '100%',
    borderRadius: 12,
  },
  container: {
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  typeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  recurringBadge: {
    marginLeft: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(136, 192, 208, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recurringText: {
    fontSize: 12,
    fontWeight: '600',
  },
  checkButton: {
    marginLeft: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 35,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    alignItems: 'center',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreTagsText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rightFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  timeText: {
    fontSize: 11,
    marginLeft: 4,
    fontWeight: '500',
  },
  xpContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(235, 203, 139, 0.1)',
  },
  xpText: {
    fontSize: 11,
    marginLeft: 2,
    fontWeight: '600',
  },
});