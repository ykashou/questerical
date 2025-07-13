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
  Menu,
  X
} from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useNotificationStore from '@/store/notificationStore';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  useSharedValue, 
  withTiming,
  Easing,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const COLLAPSED_WIDTH = 0;
const EXPANDED_WIDTH = 250;

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
  badge?: number;
};

interface LeftSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeftSidebar({ isOpen, onClose }: LeftSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, theme } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  
  // Animation values
  const sidebarWidth = useSharedValue(isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH);
  const opacity = useSharedValue(isOpen ? 1 : 0);

  // Update animation values when isOpen changes
  useEffect(() => {
    sidebarWidth.value = withSpring(
      isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
      {
        damping: 20,
        stiffness: 200,
      }
    );
    
    opacity.value = withTiming(
      isOpen ? 1 : 0,
      {
        duration: 300,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      }
    );
  }, [isOpen]);

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
      label: 'Create Quest',
      path: '/create'
    },
    { 
      name: 'calendar', 
      icon: <Calendar size={24} color={pathname === '/calendar' ? colors.primary : colors.text} />,
      label: 'Calendar',
      path: '/calendar'
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
      name: 'notifications', 
      icon: <Bell size={24} color={pathname === '/notifications' ? colors.primary : colors.text} />,
      label: 'Notifications',
      path: '/notifications',
      badge: unreadCount,
    },
    { 
      name: 'stats', 
      icon: <BarChart size={24} color={colors.text} />,
      label: 'Stats',
    },
    { 
      name: 'shared', 
      icon: <Users size={24} color={colors.text} />,
      label: 'Shared Quests',
    },
    { 
      name: 'search', 
      icon: <Search size={24} color={colors.text} />,
      label: 'Search',
    },
  ];

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      width: sidebarWidth.value,
      opacity: opacity.value,
    };
  });

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        opacity.value,
        [0, 1],
        [0, 0.5],
        Extrapolate.CLAMP
      ),
      display: opacity.value === 0 ? 'none' : 'flex',
    };
  });

  const handleNavigation = (path: string) => {
    router.push(path);
    onClose();
  };

  return (
    <>
      <Animated.View 
        style={[
          styles.overlay,
          overlayStyle,
          { backgroundColor: 'black' }
        ]}
      >
        <TouchableOpacity 
          style={styles.overlayTouchable}
          onPress={onClose}
          activeOpacity={1}
        />
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.container, 
          sidebarStyle,
          { 
            backgroundColor: colors.background,
            borderRightColor: colors.border,
          }
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Questerical</Text>
          <TouchableOpacity onPress={onClose} hitSlop={10}>
            <X size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.mainTabsContainer}>
          {mainTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                pathname === tab.path && { backgroundColor: colors.card }
              ]}
              onPress={() => handleNavigation(tab.path)}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              <Text 
                style={[
                  styles.tabLabel, 
                  { color: pathname === tab.path ? colors.primary : colors.text }
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Features</Text>
        
        <View style={styles.featureTabsContainer}>
          {featureTabs.map((tab) => (
            <TouchableOpacity
              key={tab.name}
              style={[
                styles.tab,
                tab.path && pathname === tab.path && { backgroundColor: colors.card }
              ]}
              onPress={tab.path ? () => handleNavigation(tab.path) : (tab.onPress || (() => {}))}
            >
              <View style={styles.iconContainer}>
                {tab.icon}
              </View>
              <Text style={[
                styles.tabLabel, 
                { color: tab.path && pathname === tab.path ? colors.primary : colors.text }
              ]}>
                {tab.label}
              </Text>
              {tab.badge && tab.badge > 0 && (
                <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                  <Text style={[styles.badgeText, { color: colors.text }]}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  overlayTouchable: {
    width: '100%',
    height: '100%',
  },
  container: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 101,
    borderRightWidth: 1,
    paddingTop: 50, // Space for the status bar
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  mainTabsContainer: {
    alignItems: 'flex-start',
  },
  featureTabsContainer: {
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
    flex: 1,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    width: '90%',
    alignSelf: 'center',
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 20,
    marginBottom: 10,
  }
});