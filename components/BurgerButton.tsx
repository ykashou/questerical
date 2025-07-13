import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { Menu } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';

interface BurgerButtonProps {
  onPress: () => void;
}

export default function BurgerButton({ onPress }: BurgerButtonProps) {
  const { colors } = useThemeStore();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.card }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Menu size={20} color={colors.text} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
});