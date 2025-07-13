import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Trash2, Info, TestTube, ArrowLeft, Clock, Target, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';
import useTimerStore from '@/store/timerStore';

// Define proper types for settings items
type SwitchSettingItem = {
  icon: React.ReactNode;
  title: string;
  type: 'switch';
  value: boolean;
  onToggle: () => void;
};

type ButtonSettingItem = {
  icon: React.ReactNode;
  title: string;
  type: 'button';
  buttonText: string;
  buttonColor: string;
  onPress: () => void;
  danger?: boolean;
};

type InfoSettingItem = {
  icon: React.ReactNode;
  title: string;
  type: 'info';
  value: string;
};

type SettingItem = SwitchSettingItem | ButtonSettingItem | InfoSettingItem;

type SettingSection = {
  title: string;
  items: SettingItem[];
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, theme, toggleTheme } = useThemeStore();
  const { 
    deleteQuest, 
    quests, 
    isSandboxMode, 
    enableSandboxMode, 
    disableSandboxMode 
  } = useQuestStore();
  const { settings, updateSettings } = useTimerStore();
  
  const handleClearAllQuests = () => {
    if (isSandboxMode) {
      Alert.alert(
        'Sandbox Mode Active',
        'You cannot clear quests while in Sandbox Mode. Exit Sandbox Mode first to manage your real data.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    Alert.alert(
      'Clear All Quests',
      'Are you sure you want to delete all quests? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete All', 
          style: 'destructive',
          onPress: () => {
            quests.forEach(quest => deleteQuest(quest.id));
          }
        },
      ]
    );
  };
  
  const handleToggleSandboxMode = () => {
    if (isSandboxMode) {
      Alert.alert(
        'Exit Sandbox Mode',
        'Are you sure you want to exit Sandbox Mode? All sandbox data will be lost and your original data will be restored.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Exit Sandbox', 
            style: 'default',
            onPress: disableSandboxMode
          },
        ]
      );
    } else {
      Alert.alert(
        'Enter Sandbox Mode',
        'Sandbox Mode will temporarily replace your data with sample quests for testing and exploration. Your original data will be safely stored and restored when you exit.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Enter Sandbox', 
            style: 'default',
            onPress: enableSandboxMode
          },
        ]
      );
    }
  };

  const settingsSections: SettingSection[] = [
    {
      title: 'Appearance',
      items: [
        {
          icon: theme === 'dark' ? <Moon size={22} color={colors.text} /> : <Sun size={22} color={colors.text} />,
          title: 'Dark Mode',
          type: 'switch',
          value: theme === 'dark',
          onToggle: toggleTheme,
        },
      ],
    },
    {
      title: 'Timer Settings',
      items: [
        {
          icon: <Clock size={22} color={colors.primary} />,
          title: 'Timer Configuration',
          type: 'button',
          buttonText: 'Configure',
          buttonColor: colors.primary,
          onPress: () => router.push('/timer-settings'),
        },
        {
          icon: <Target size={22} color={colors.text} />,
          title: 'Auto-start Breaks',
          type: 'switch',
          value: settings.autoStartBreaks,
          onToggle: () => updateSettings({ autoStartBreaks: !settings.autoStartBreaks }),
        },
        {
          icon: <Target size={22} color={colors.text} />,
          title: 'Sound Notifications',
          type: 'switch',
          value: settings.soundEnabled,
          onToggle: () => updateSettings({ soundEnabled: !settings.soundEnabled }),
        },
      ],
    },
    {
      title: 'Development',
      items: [
        {
          icon: isSandboxMode 
            ? <ArrowLeft size={22} color={colors.primary} /> 
            : <TestTube size={22} color={colors.primary} />,
          title: isSandboxMode ? 'Exit Sandbox Mode' : 'Enter Sandbox Mode',
          type: 'button',
          buttonText: isSandboxMode ? 'Exit' : 'Enter',
          buttonColor: colors.primary,
          onPress: handleToggleSandboxMode,
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          icon: <Trash2 size={22} color={colors.danger} />,
          title: 'Clear All Quests',
          type: 'button',
          buttonText: 'Clear',
          buttonColor: colors.danger,
          onPress: handleClearAllQuests,
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: <Info size={22} color={colors.text} />,
          title: 'Version',
          type: 'info',
          value: '1.0.0',
        },
      ],
    },
  ];

  // Helper functions to check item type
  const isSwitchItem = (item: SettingItem): item is SwitchSettingItem => 
    item.type === 'switch';
  
  const isButtonItem = (item: SettingItem): item is ButtonSettingItem => 
    item.type === 'button';
  
  const isInfoItem = (item: SettingItem): item is InfoSettingItem => 
    item.type === 'info';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {isSandboxMode && (
        <View style={[styles.sandboxBanner, { backgroundColor: colors.primary }]}>
          <TestTube size={16} color={colors.background} />
          <Text style={[styles.sandboxText, { color: colors.background }]}>
            Sandbox Mode Active - Sample data is being used
          </Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.content}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.items.map((item, itemIndex) => (
                <View 
                  key={itemIndex} 
                  style={[
                    styles.settingItem,
                    itemIndex < section.items.length - 1 && [styles.settingItemBorder, { borderBottomColor: colors.border }],
                  ]}
                >
                  <View style={styles.settingItemLeft}>
                    {item.icon}
                    <Text 
                      style={[
                        styles.settingItemTitle, 
                        { 
                          color: isButtonItem(item) && item.danger 
                            ? colors.danger 
                            : colors.text 
                        }
                      ]}
                    >
                      {item.title}
                    </Text>
                  </View>
                  
                  {isSwitchItem(item) && (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: colors.border, true: colors.primary }}
                      thumbColor={colors.text}
                    />
                  )}
                  
                  {isButtonItem(item) && (
                    <TouchableOpacity
                      style={[styles.settingButton, { backgroundColor: item.buttonColor }]}
                      onPress={item.onPress}
                    >
                      <Text style={[styles.settingButtonText, { color: colors.text }]}>
                        {item.buttonText}
                      </Text>
                    </TouchableOpacity>
                  )}
                  
                  {isInfoItem(item) && (
                    <Text style={[styles.settingItemValue, { color: colors.textSecondary }]}>
                      {item.value}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 8,
  },
  sandboxText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  sectionContent: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingItemTitle: {
    fontSize: 16,
  },
  settingItemValue: {
    fontSize: 16,
  },
  settingButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  settingButtonText: {
    fontWeight: '500',
  },
});