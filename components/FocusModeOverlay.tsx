import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { Target, X } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';
import useQuestStore from '@/store/questStore';

const { width, height } = Dimensions.get('window');

export default function FocusModeOverlay() {
  const { colors } = useThemeStore();
  const { focusMode, disableFocusMode } = useTimerStore();
  const { quests } = useQuestStore();
  
  if (!focusMode.isActive) {
    return null;
  }
  
  const focusQuests = quests.filter(q => focusMode.questIds.includes(q.id));
  const focusDuration = focusMode.startTime 
    ? Math.round((Date.now() - focusMode.startTime) / 60000)
    : 0;
  
  return (
    <View style={[styles.overlay, { backgroundColor: colors.primary + '10' }]}>
      <View style={[styles.banner, { 
        backgroundColor: colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }]}>
        <View style={styles.bannerContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background + '20' }]}>
            <Target size={18} color={colors.background} />
          </View>
          <View style={styles.bannerText}>
            <Text style={[styles.bannerTitle, { color: colors.background }]}>
              Focus Mode Active
            </Text>
            <Text style={[styles.bannerSubtitle, { color: colors.background + 'CC' }]}>
              {focusDuration > 0 ? `${focusDuration} min` : 'Just started'} • {focusQuests.length} quest{focusQuests.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity
          style={[styles.closeButton, { backgroundColor: colors.background + '20' }]}
          onPress={disableFocusMode}
          activeOpacity={0.7}
        >
          <X size={18} color={colors.background} />
        </TouchableOpacity>
      </View>
      
      {focusMode.customMessage && (
        <View style={[styles.messageContainer, { 
          backgroundColor: colors.card,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 2,
        }]}>
          <Text style={[styles.message, { color: colors.text }]}>
            {focusMode.customMessage}
          </Text>
        </View>
      )}
      
      {focusQuests.length > 0 && (
        <View style={[styles.questsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.questsTitle, { color: colors.text }]}>
            Focus Quests:
          </Text>
          {focusQuests.slice(0, 3).map((quest) => (
            <View key={quest.id} style={styles.questItem}>
              <View style={[styles.questDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.questTitle, { color: colors.text }]} numberOfLines={1}>
                {quest.title}
              </Text>
              <Text style={[styles.questProgress, { color: colors.textSecondary }]}>
                {quest.progress}%
              </Text>
            </View>
          ))}
          {focusQuests.length > 3 && (
            <Text style={[styles.moreQuests, { color: colors.textSecondary }]}>
              +{focusQuests.length - 3} more quest{focusQuests.length - 3 !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50, // Account for status bar
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  bannerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  closeButton: {
    padding: 8,
    borderRadius: 12,
  },
  messageContainer: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  questsContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  questsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  questItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  questDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  questTitle: {
    flex: 1,
    fontSize: 14,
  },
  questProgress: {
    fontSize: 12,
    fontWeight: '500',
  },
  moreQuests: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});