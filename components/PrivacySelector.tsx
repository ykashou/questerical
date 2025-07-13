import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Lock, Users, Globe } from 'lucide-react-native';
import { PrivacyType } from '@/types/quest';
import useThemeStore from '@/store/themeStore';

interface PrivacySelectorProps {
  value: PrivacyType;
  onChange: (value: PrivacyType) => void;
}

export default function PrivacySelector({ value, onChange }: PrivacySelectorProps) {
  const { colors } = useThemeStore();
  
  const options: { value: PrivacyType; icon: React.ReactNode; label: string }[] = [
    {
      value: 'private',
      icon: <Lock size={18} color={value === 'private' ? colors.text : colors.textSecondary} />,
      label: 'Private',
    },
    {
      value: 'shared',
      icon: <Users size={18} color={value === 'shared' ? colors.text : colors.textSecondary} />,
      label: 'Shared',
    },
    {
      value: 'public',
      icon: <Globe size={18} color={value === 'public' ? colors.text : colors.textSecondary} />,
      label: 'Public',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>Privacy</Text>
      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              { 
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              value === option.value && { 
                backgroundColor: colors.privacyTypes[option.value],
                borderColor: colors.privacyTypes[option.value],
              },
            ]}
            onPress={() => onChange(option.value)}
          >
            {option.icon}
            <Text
              style={[
                styles.optionText,
                { color: colors.textSecondary },
                value === option.value && [styles.selectedOptionText, { color: colors.text }],
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  options: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  optionText: {
    marginLeft: 6,
    fontSize: 14,
  },
  selectedOptionText: {
    fontWeight: '500',
  },
});