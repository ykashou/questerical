import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Target, Volume2, Vibrate, Bell, Save, RotateCcw } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useThemeStore from '@/store/themeStore';
import useTimerStore from '@/store/timerStore';

export default function TimerSettingsScreen() {
  const router = useRouter();
  const { colors } = useThemeStore();
  const { settings, updateSettings } = useTimerStore();
  
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };
  
  const handleSave = () => {
    updateSettings(localSettings);
    setHasChanges(false);
    Alert.alert('Settings Saved', 'Your timer settings have been updated successfully.');
  };
  
  const handleReset = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all timer settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultSettings = {
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
            setLocalSettings(defaultSettings);
            updateSettings(defaultSettings);
            setHasChanges(false);
          }
        }
      ]
    );
  };
  
  const renderDurationSetting = (
    title: string,
    key: keyof typeof settings,
    icon: React.ReactNode,
    min: number = 1,
    max: number = 120
  ) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
      <View style={styles.settingLeft}>
        {icon}
        <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      </View>
      <View style={styles.durationControls}>
        <TouchableOpacity
          style={[styles.durationButton, { backgroundColor: colors.border }]}
          onPress={() => {
            const newValue = Math.max(min, (localSettings[key] as number) - 1);
            handleSettingChange(key, newValue);
          }}
        >
          <Text style={[styles.durationButtonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.durationValue, { color: colors.text }]}>
          {localSettings[key]} min
        </Text>
        <TouchableOpacity
          style={[styles.durationButton, { backgroundColor: colors.border }]}
          onPress={() => {
            const newValue = Math.min(max, (localSettings[key] as number) + 1);
            handleSettingChange(key, newValue);
          }}
        >
          <Text style={[styles.durationButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderSwitchSetting = (
    title: string,
    key: keyof typeof settings,
    icon: React.ReactNode,
    description?: string
  ) => (
    <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
      <View style={styles.settingLeft}>
        {icon}
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
              {description}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={localSettings[key] as boolean}
        onValueChange={(value) => handleSettingChange(key, value)}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.text}
      />
    </View>
  );
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Timer Settings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerButton, { backgroundColor: colors.textSecondary }]}
            onPress={handleReset}
          >
            <RotateCcw size={20} color={colors.background} />
          </TouchableOpacity>
          {hasChanges && (
            <TouchableOpacity
              style={[styles.headerButton, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Save size={20} color={colors.background} />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Timer Durations</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            {renderDurationSetting(
              'Pomodoro Duration',
              'pomodoroDuration',
              <Clock size={22} color={colors.primary} />,
              5,
              60
            )}
            {renderDurationSetting(
              'Short Break',
              'shortBreakDuration',
              <Target size={22} color={colors.success} />,
              1,
              30
            )}
            {renderDurationSetting(
              'Long Break',
              'longBreakDuration',
              <Target size={22} color={colors.warning} />,
              5,
              60
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Break Settings</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            <View style={[styles.settingItem, { backgroundColor: colors.card }]}>
              <View style={styles.settingLeft}>
                <Target size={22} color={colors.text} />
                <View style={styles.settingTextContainer}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>
                    Long Break Interval
                  </Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    After how many pomodoros
                  </Text>
                </View>
              </View>
              <View style={styles.durationControls}>
                <TouchableOpacity
                  style={[styles.durationButton, { backgroundColor: colors.border }]}
                  onPress={() => {
                    const newValue = Math.max(2, localSettings.longBreakInterval - 1);
                    handleSettingChange('longBreakInterval', newValue);
                  }}
                >
                  <Text style={[styles.durationButtonText, { color: colors.text }]}>-</Text>
                </TouchableOpacity>
                <Text style={[styles.durationValue, { color: colors.text }]}>
                  {localSettings.longBreakInterval}
                </Text>
                <TouchableOpacity
                  style={[styles.durationButton, { backgroundColor: colors.border }]}
                  onPress={() => {
                    const newValue = Math.min(10, localSettings.longBreakInterval + 1);
                    handleSettingChange('longBreakInterval', newValue);
                  }}
                >
                  <Text style={[styles.durationButtonText, { color: colors.text }]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {renderSwitchSetting(
              'Auto-start Breaks',
              'autoStartBreaks',
              <Target size={22} color={colors.text} />,
              'Automatically start break timers'
            )}
            
            {renderSwitchSetting(
              'Auto-start Pomodoros',
              'autoStartPomodoros',
              <Clock size={22} color={colors.text} />,
              'Automatically start next pomodoro after break'
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
            {renderSwitchSetting(
              'Sound Notifications',
              'soundEnabled',
              <Volume2 size={22} color={colors.text} />,
              'Play sound when timer completes'
            )}
            
            {renderSwitchSetting(
              'Vibration',
              'vibrationEnabled',
              <Vibrate size={22} color={colors.text} />,
              'Vibrate when timer completes'
            )}
            
            {renderSwitchSetting(
              'Push Notifications',
              'showNotifications',
              <Bell size={22} color={colors.text} />,
              'Show system notifications'
            )}
          </View>
        </View>
      </ScrollView>
      
      {hasChanges && (
        <View style={[styles.saveBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <Text style={[styles.saveText, { color: colors.textSecondary }]}>
            You have unsaved changes
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.saveButtonText, { color: colors.background }]}>
              Save Changes
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  durationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  durationButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 60,
    textAlign: 'center',
  },
  saveBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  saveText: {
    fontSize: 14,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});