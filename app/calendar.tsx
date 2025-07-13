import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import useThemeStore from '@/store/themeStore';
import useQuestStore from '@/store/questStore';
import CalendarTooltip from '@/components/CalendarTooltip';

// Days of the week
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalendarScreen() {
  const { colors } = useThemeStore();
  const quests = useQuestStore((state) => state.quests);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [completionData, setCompletionData] = useState<{
    main: number;
    side: number;
    mini: number;
    total: number;
  }>({ main: 0, side: 0, mini: 0, total: 0 });

  // Calculate quest completions for each day of the current month
  const [dailyCompletions, setDailyCompletions] = useState<Record<string, {
    main: number;
    side: number;
    mini: number;
    total: number;
  }>>({});

  useEffect(() => {
    calculateDailyCompletions();
  }, [quests, currentDate]);

  const calculateDailyCompletions = () => {
    const completions: Record<string, { main: number; side: number; mini: number; total: number }> = {};
    
    // Initialize all days of the month
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      completions[dateKey] = { main: 0, side: 0, mini: 0, total: 0 };
    }
    
    // Count completed quests for each day
    quests.forEach(quest => {
      if (quest.completed) {
        // Use updatedAt as the completion date
        const completionDate = new Date(quest.updatedAt);
        const completionYear = completionDate.getFullYear();
        const completionMonth = completionDate.getMonth();
        
        // Only count if it's in the current month view
        if (completionYear === year && completionMonth === month) {
          const day = completionDate.getDate();
          const dateKey = `${year}-${month + 1}-${day}`;
          
          if (completions[dateKey]) {
            completions[dateKey][quest.type]++;
            completions[dateKey].total++;
          }
        }
      }
    });
    
    setDailyCompletions(completions);
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() - 1);
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + 1);
      return newDate;
    });
    setSelectedDate(null);
  };

  const handleDayPress = (day: number, event: any) => {
    // Get the position of the touch for tooltip placement
    const { pageX, pageY } = event.nativeEvent;
    const screenHeight = Dimensions.get('window').height;
    
    // Calculate better initial position
    let tooltipY = pageY - 140; // Try to show above touch point
    
    // If too close to top, show below instead
    if (tooltipY < 100) {
      tooltipY = pageY + 40;
    }
    
    setTooltipPosition({ x: pageX, y: tooltipY });
    
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    
    // If the same day is selected, deselect it
    if (selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() === newDate.getMonth() && 
        selectedDate.getFullYear() === newDate.getFullYear()) {
      setSelectedDate(null);
      return;
    }
    
    setSelectedDate(newDate);
    
    // Get completion data for the selected day
    const dateKey = `${newDate.getFullYear()}-${newDate.getMonth() + 1}-${day}`;
    const dayData = dailyCompletions[dateKey] || { main: 0, side: 0, mini: 0, total: 0 };
    setCompletionData(dayData);
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    
    // Get the number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Get the number of days in the previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const calendarDays = [];
    
    // Previous month days
    for (let i = 0; i < firstDay; i++) {
      const prevMonthDay = daysInPrevMonth - firstDay + i + 1;
      calendarDays.push(
        <TouchableOpacity 
          key={`prev-${prevMonthDay}`}
          style={[styles.dayCell, { opacity: 0.3 }]}
          disabled={true}
        >
          <Text style={[styles.dayText, { color: colors.textSecondary }]}>{prevMonthDay}</Text>
        </TouchableOpacity>
      );
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${month + 1}-${day}`;
      const dayData = dailyCompletions[dateKey] || { total: 0 };
      
      // Determine heat color based on completion count
      let heatColor = colors.background;
      if (dayData.total > 0) {
        const intensity = Math.min(dayData.total / 5, 1); // Max intensity at 5 completions
        heatColor = dayData.total >= 5 
          ? colors.success 
          : `rgba(${parseInt(colors.success.slice(1, 3), 16)}, ${parseInt(colors.success.slice(3, 5), 16)}, ${parseInt(colors.success.slice(5, 7), 16)}, ${intensity})`;
      }
      
      // Check if this day is selected
      const isSelected = selectedDate && 
                         selectedDate.getDate() === day && 
                         selectedDate.getMonth() === month && 
                         selectedDate.getFullYear() === year;
      
      // Check if this day is today
      const isToday = new Date().getDate() === day && 
                      new Date().getMonth() === month && 
                      new Date().getFullYear() === year;
      
      calendarDays.push(
        <TouchableOpacity 
          key={`current-${day}`}
          style={[
            styles.dayCell, 
            { backgroundColor: heatColor },
            isSelected && { borderColor: colors.primary, borderWidth: 2 },
            isToday && { borderColor: colors.accent, borderWidth: isSelected ? 0 : 2 }
          ]}
          onPress={(e) => handleDayPress(day, e)}
        >
          <Text 
            style={[
              styles.dayText, 
              { color: dayData.total > 3 ? colors.text : colors.text },
              isSelected && { fontWeight: '700' }
            ]}
          >
            {day}
          </Text>
          {dayData.total > 0 && (
            <View style={styles.completionIndicator}>
              <Text style={[styles.completionText, { color: colors.text }]}>
                {dayData.total}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }
    
    // Next month days
    const totalCells = 42; // 6 rows of 7 days
    const remainingCells = totalCells - calendarDays.length;
    
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push(
        <TouchableOpacity 
          key={`next-${day}`}
          style={[styles.dayCell, { opacity: 0.3 }]}
          disabled={true}
        >
          <Text style={[styles.dayText, { color: colors.textSecondary }]}>{day}</Text>
        </TouchableOpacity>
      );
    }
    
    return calendarDays;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          
          <Text style={[styles.monthYearText, { color: colors.text }]}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <ChevronRight size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView contentContainerStyle={styles.calendarContainer}>
        <View style={styles.weekdaysRow}>
          {DAYS.map(day => (
            <View key={day} style={styles.weekdayCell}>
              <Text style={[styles.weekdayText, { color: colors.textSecondary }]}>{day}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {renderCalendar()}
        </View>
        
        <View style={styles.legend}>
          <Text style={[styles.legendTitle, { color: colors.text }]}>Activity Level</Text>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.background }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>None</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.success + '40' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Low</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.success + '80' }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>Medium</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: colors.success }]} />
              <Text style={[styles.legendText, { color: colors.textSecondary }]}>High</Text>
            </View>
          </View>
        </View>
      </ScrollView>
      
      {selectedDate && (
        <View style={styles.tooltipContainer}>
          <CalendarTooltip 
            date={selectedDate}
            position={tooltipPosition}
            data={completionData}
            onClose={() => setSelectedDate(null)}
          />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  navButton: {
    padding: 8,
  },
  monthYearText: {
    fontSize: 20,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: 16,
  },
  weekdaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontWeight: '500',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 days per row
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
  },
  completionIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  completionText: {
    fontSize: 10,
    fontWeight: '700',
  },
  legend: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 4,
  },
  legendText: {
    fontSize: 12,
  },
  tooltipContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none',
  },
});