import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { Moon, Sun } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';

export default function ThemeToggle() {
  const { theme, toggleTheme, colors } = useThemeStore();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]} 
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      {theme === 'dark' ? (
        <Moon size={20} color={colors.text} />
      ) : (
        <Sun size={20} color={colors.text} />
      )}
      <Text style={[styles.text, { color: colors.text }]}>
        {theme === 'dark' ? 'Dark' : 'Light'}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
  },
  text: {
    fontWeight: '500',
    fontSize: 14,
  },
});