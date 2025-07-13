import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Moon, Sun, Trash2, Info } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';

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
  const { colors, theme, toggleTheme } = useThemeStore();
  const deleteQuest = useQuestStore((state) => state.deleteQuest);
  const quests = useQuestStore((state) => state.quests);
  
  const handleClearAllQuests = () => {
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