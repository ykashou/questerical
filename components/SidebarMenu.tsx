import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, Dimensions, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { 
  Home, 
  PlusCircle, 
  Settings, 
  Calendar, 
  BarChart, 
  Users, 
  Bell, 
  Star, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useAnimatedGestureHandler } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const COLLAPSED_WIDTH = 70;
const EXPANDED_WIDTH = 220;
const SWIPE_THRESHOLD = 50;

// Define proper types for tabs
type MainTab = {
  name: string;
  icon: React.ReactNode;
  label: string;
  path: string;
};

type FeatureTab = {
  name: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  onPress?: () => void;
};

export default function SidebarMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, theme } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Animation values
  const sidebarWidth = useSharedValue(COLLAPSED_WIDTH);
  const expandProgress = useSharedValue(0);

  // Load saved state on mount
  useEffect(() => {
    const loadSidebarState = async () => {
      try {
        const savedState = await AsyncStorage.getItem('sidebar-expanded');
        if (savedState !== null) {
          const expanded = savedState === 'true';
          setIsExpanded(expanded);
          sidebarWidth.value = expanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH;
          expandProgress.value = expanded ? 1 : 0;
        }
      } catch (error) {
        console.error('Failed to load sidebar state', error);
      }
    };
    
    loadSidebarState();
  }, []);

  // Save state when it changes
  useEffect(() => {
    const saveSidebarState = async () => {
      try {
        await AsyncStorage.setItem('sidebar-expanded', isExpanded.toString());
      } catch (error) {
        console.error('Failed to save sidebar state', error);
      }
    };
    
    saveSidebarState();
  }, [isExpanded]);

  const mainTabs: MainTab[] = [
    { 
      name: 'home', 
      icon: <Home size={24} color={pathname === '/' ? colors.primary : colors.text} />,
      label: 'Home',
      path: '/'
    },
    { 
      name: 'create', 
      icon: <PlusCircle size={24} color={pathname === '/create' ? colors.primary : colors.text} />,
      label: 'Create',
      path: '/create'
    },
    { 
      name: 'settings', 
      icon: <Settings size={24} color={pathname === '/settings' ? colors.primary : colors.text} />,
      label: 'Settings',
      path: '/settings'
    }
  ];

  const featureTabs: FeatureTab[] = [
    { 
      name: 'calendar', 
      icon: <Calendar size={24} color={colors.text} />,
      label: 'Calendar',
    },
    { 
      name: 'stats', 
      icon: <BarChart size={24} color={colors.text} />,
      label: 'Stats',
    },
    { 
      name: 'shared', 
      icon: <Users size={24} color={colors.text} />,
      label: 'Shared',
    },
    { 
      name: 'notifications', 
      icon: <Bell size={24} color={colors.text} />,
      label: 'Alerts',
    },
    { 
      name: 'favorites', 
      icon: <Star size={24} color={colors.text} />,
      label: 'Search',
    },
  ];

  // Gesture handler for swipe
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = sidebarWidth.value;
    },
    onActive: (event, ctx) => {
      // For right sidebar, we want to expand when swiping left
      const newWidth = ctx.startX - event.translationX;
      sidebarWidth.value = Math.max(
        COLLAPSED_WIDTH,
        Math.min(EXPANDED_WIDTH, newWidth)
      );
      
      // Calculate progress based on current width
      expandProgress.value = interpolate(
        sidebarWidth.value,
        [COLLAPSED_WIDTH, EXPANDED_WIDTH],
        [0, 1],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      // Determine if we should snap to expanded or collapsed
      const shouldExpand = 
        (isExpanded && event.velocityX < 500) || // If already expanded and not swiping right fast
        (!isExpanded && event.translationX < -SWIPE_THRESHOLD); // If collapsed and swiped left enough
      
      // Update the expanded state
      setIsExpanded(shouldExpand);
      
      sidebarWidth.value = withSpring(
        shouldExpand ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        {
          damping: 20,
          stiffness: 200,
        }
      );
      
      expandProgress.value = withTiming(
        shouldExpand ? 1 : 0,
        {
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        }
      );
    },
  });

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      width: sidebarWidth.value,
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    return {
      opacity: expandProgress.value,
      width: interpolate(
        expandProgress.value,
        [0, 1],
        [0, EXPANDED_WIDTH - COLLAPSED_WIDTH - 20],
        Extrapolate.CLAMP
      ),
    };
  });

  const toggleExpand = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    
    sidebarWidth.value = withSpring(
      newState ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      {
        damping: 20,
        stiffness: 200,
      }
    );
    
    expandProgress.value = withTiming(
      newState ? 1 : 0,
      {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
  };

  // For web compatibility, use a simpler version
  if (Platform.OS === 'web') {
    return (
      <View 
        style={[
          styles.container, 
          { 
            width: isExpanded ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
            backgroundColor: theme === 'dark' 
              ? 'rgba(46, 52, 64, 0.95)' 
              : 'rgba(236, 239, 244, 0.95)',
            borderLeftColor: colors.border,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={toggleExpand}
        >
          {isExpanded ? (
            <ChevronRight size={24} color={colors.text} />
          ) : (
            <ChevronLeft size={24} color={colors.text} />
          )}
        </TouchableOpacity>
        
        <View style={styles.mainTabsContainer}>
          {mainTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                pathname === tab.path && { backgroundColor: colors.card }
              ]}
              onPress={() => router.push(tab.path)}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              {isExpanded && (
                <Text 
                  style={[
                    styles.tabLabel, 
                    { color: pathname === tab.path ? colors.primary : colors.text }
                  ]}
                >
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={styles.divider} />
        
        <View style={styles.featureTabsContainer}>
          {featureTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={tab.onPress || (() => {})}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              {isExpanded && (
                <Text style={[styles.tabLabel, { color: colors.text }]}>
                  {tab.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View 
        style={[
          styles.container, 
          sidebarStyle,
          { 
            backgroundColor: theme === 'dark' 
              ? 'rgba(46, 52, 64, 0.95)' 
              : 'rgba(236, 239, 244, 0.95)',
            borderLeftColor: colors.border,
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.toggleButton}
          onPress={toggleExpand}
        >
          {isExpanded ? (
            <ChevronRight size={24} color={colors.text} />
          ) : (
            <ChevronLeft size={24} color={colors.text} />
          )}
        </TouchableOpacity>
        
        <View style={styles.mainTabsContainer}>
          {mainTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                pathname === tab.path && { backgroundColor: colors.card }
              ]}
              onPress={() => router.push(tab.path)}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              <Animated.Text 
                style={[
                  styles.tabLabel, 
                  labelStyle,
                  { color: pathname === tab.path ? colors.primary : colors.text }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <View style={styles.featureTabsContainer}>
          {featureTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={tab.onPress || (() => {})}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              <Animated.Text 
                style={[
                  styles.tabLabel, 
                  labelStyle,
                  { color: colors.text }
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Animated.Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
    borderLeftWidth: 1,
    paddingTop: 50, // Space for the status bar
    paddingBottom: 20,
  },
  toggleButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 101,
  },
  mainTabsContainer: {
    marginTop: 40,
    alignItems: 'flex-start',
  },
  featureTabsContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    width: '100%',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 12,
  },
  divider: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
    marginVertical: 20,
  },
});