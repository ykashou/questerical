import React from 'react';
import { StyleSheet, Text, View, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TestTube, Sparkles, BarChart3 } from 'lucide-react-native';
import useQuestStore from '@/store/questStore';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';
import BottomNavbar from '@/components/BottomNavbar';
import QuickActions from '@/components/QuickActions';
import QuestAnalytics from '@/components/QuestAnalytics';
import TimerDisplay from '@/components/TimerDisplay';
import FocusModeOverlay from '@/components/FocusModeOverlay';

export default function HomeScreen() {
  const router = useRouter();
  const { isSandboxMode } = useQuestStore();
  const { colors } = useThemeStore();
  const { currentSession } = useTimerStore();



  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar 
        barStyle={colors.background === '#FEFEFE' ? 'dark-content' : 'light-content'} 
        backgroundColor={colors.background} 
      />
      
      {/* Sandbox Mode Banner */}
      {isSandboxMode && (
        <View style={[styles.sandboxBanner, { backgroundColor: colors.primary }]}>
          <TestTube size={16} color={colors.background} />
          <Text style={[styles.sandboxText, { color: colors.background }]}>
            Sandbox Mode - Using sample data
          </Text>
        </View>
      )}
      
      {/* Focus Mode Overlay */}
      <FocusModeOverlay />
      
      {/* Timer Display */}
      {currentSession && (
        <View style={styles.timerContainer}>
          <TimerDisplay compact />
        </View>
      )}
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.welcomeSection}>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome back</Text>
            <View style={styles.titleRow}>
              <Text style={[styles.appTitle, { color: colors.text }]}>Analytics Dashboard</Text>
              <BarChart3 size={18} color={colors.primary} />
            </View>
          </View>
        </View>
      </View>
      
      {/* Quick Stats */}
      <QuickActions />

      {/* Analytics Content */}
      <View style={styles.content}>
        <QuestAnalytics />
      </View>

      {/* Bottom Navbar */}
      <BottomNavbar 
        onCreateQuest={() => router.push('/create')}
      />


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sandboxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 6,
  },
  sandboxText: {
    fontSize: 12,
    fontWeight: '500',
  },
  timerContainer: {
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTop: {
    marginBottom: 12,
  },
  welcomeSection: {
    gap: 2,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  content: {
    flex: 1,
    width: '100%',
  },
});