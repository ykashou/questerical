import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';

interface CalendarTooltipProps {
  date: Date;
  position: { x: number; y: number };
  data: {
    main: number;
    side: number;
    mini: number;
    total: number;
  };
  onClose: () => void;
}

export default function CalendarTooltip({ date, position, data, onClose }: CalendarTooltipProps) {
  const { colors } = useThemeStore();
  
  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          top: position.y,
          left: position.x - 150, // Center the tooltip
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {formatDate(date)}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={10}>
          <X size={18} color={colors.text} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          {data.total} {data.total === 1 ? 'Quest' : 'Quests'} Completed
        </Text>
        
        <View style={styles.breakdown}>
          <View style={styles.breakdownItem}>
            <View style={[styles.colorIndicator, { backgroundColor: colors.questTypes.main }]} />
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Main:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>{data.main}</Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <View style={[styles.colorIndicator, { backgroundColor: colors.questTypes.side }]} />
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Side:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>{data.side}</Text>
          </View>
          
          <View style={styles.breakdownItem}>
            <View style={[styles.colorIndicator, { backgroundColor: colors.questTypes.mini }]} />
            <Text style={[styles.breakdownLabel, { color: colors.textSecondary }]}>Mini:</Text>
            <Text style={[styles.breakdownValue, { color: colors.text }]}>{data.mini}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 300,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  breakdown: {
    gap: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  breakdownLabel: {
    fontSize: 14,
    marginRight: 4,
    width: 50,
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});