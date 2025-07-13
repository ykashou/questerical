import React, { useState, useEffect } from 'react';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';
import ThemeToggle from '@/components/ThemeToggle';
import BurgerButton from '@/components/BurgerButton';
import LeftSidebar from '@/components/LeftSidebar';

export default function RootLayout() {
  const { colors, theme } = useThemeStore();
  const { currentSession, timerState, stopTimer } = useTimerStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  // Timer update effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerState === 'running' && currentSession) {
      interval = setInterval(() => {
        const elapsed = Date.now() - currentSession.startTime - currentSession.totalPausedDuration;
        const remaining = Math.max(0, (currentSession.duration * 60 * 1000) - elapsed);
        
        if (remaining <= 0) {
          stopTimer(true);
        }
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerState, currentSession, stopTimer]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        <Tabs
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.background,
            },
            headerTintColor: colors.text,
            headerTitleStyle: {
              fontWeight: '600',
            },
            tabBarStyle: {
              display: 'none', // Hide the default tab bar
            },
            headerRight: () => <ThemeToggle />,
            headerLeft: () => <BurgerButton onPress={toggleSidebar} />,
          }}
          tabBar={() => null} // No tab bar, we'll use our sidebar
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Questerical',
            }}
          />
          <Tabs.Screen
            name="create"
            options={{
              title: 'Create Quest',
            }}
          />
          <Tabs.Screen
            name="calendar"
            options={{
              title: 'Calendar',
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
            }}
          />
          <Tabs.Screen
            name="quest/[id]"
            options={{
              title: 'Quest Details',
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="edit/[id]"
            options={{
              title: 'Edit Quest',
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="timer-settings"
            options={{
              title: 'Timer Settings',
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              href: null, // Hide from tab bar
            }}
          />
          <Tabs.Screen
            name="+not-found"
            options={{
              title: 'Not Found',
              href: null, // Hide from tab bar
            }}
          />
        </Tabs>
        <LeftSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      </View>
    </GestureHandlerRootView>
  );
}