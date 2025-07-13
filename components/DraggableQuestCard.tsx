import React, { useRef } from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  runOnJS,
  useSharedValue,
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import QuestCard from './QuestCard';
import { Quest } from '@/types/quest';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface DraggableQuestCardProps {
  quest: Quest;
  index: number;
  questsCount: number;
  onDragEnd: () => void;
  onMoveItem: (from: number, to: number) => void;
  scrollY: Animated.SharedValue<number>;
  cardHeight: number;
}

export default function DraggableQuestCard({
  quest,
  index,
  questsCount,
  onDragEnd,
  onMoveItem,
  scrollY,
  cardHeight,
}: DraggableQuestCardProps) {
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(false);
  const currentIndex = useSharedValue(index);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      isActive.value = true;
      currentIndex.value = index;
    },
    onActive: (event) => {
      translateY.value = event.translationY;
      
      // Calculate the target position based on drag distance
      const newPosition = Math.floor((event.translationY + index * cardHeight + cardHeight / 2) / cardHeight);
      
      // Ensure target position is within bounds
      const clampedPosition = Math.max(0, Math.min(questsCount - 1, newPosition));
      
      // Only update if position changed
      if (clampedPosition !== currentIndex.value) {
        runOnJS(onMoveItem)(currentIndex.value, clampedPosition);
        currentIndex.value = clampedPosition;
      }
    },
    onEnd: () => {
      // Animate back to position
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
      });
      
      // Small delay before setting inactive to allow animation to complete
      setTimeout(() => {
        isActive.value = false;
      }, 100);
      
      // Notify parent that dragging has ended
      runOnJS(onDragEnd)();
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      // Combine both transformations into a single transform array
      transform: [
        { translateY: translateY.value },
        { scale: withSpring(isActive.value ? 1.02 : 1) }
      ],
      zIndex: isActive.value ? 1000 : 1,
      shadowOpacity: withSpring(isActive.value ? 0.3 : 0),
      shadowRadius: withSpring(isActive.value ? 10 : 0),
      elevation: isActive.value ? 5 : 0,
    };
  });

  // On web, we'll use a simpler version without animations
  if (Platform.OS === 'web') {
    return <QuestCard quest={quest} />;
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <QuestCard quest={quest} />
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
});