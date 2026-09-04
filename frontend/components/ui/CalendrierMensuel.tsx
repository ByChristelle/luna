import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';

interface CalendrierMensuelProps {
  lastPeriodDate: string;
  cycleLength?: number;
  periodLength?: number;
  onSelectDate?: (date: Date) => void;
}

export default function CalendrierMensuel({
  lastPeriodDate,
  cycleLength = 28,
  periodLength = 5,
  onSelectDate,
}: CalendrierMensuelProps) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayStyle = (dayNumber: number) => {
    const targetDate = new Date(currentYear, currentMonth, dayNumber);
    const startDate = new Date(lastPeriodDate);

    const diffTime = targetDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { bg: 'transparent', color: '#999999', isPeriod: false, isFertile: false };

    const cycleDay = (diffDays % cycleLength) + 1;

    // Règles : du jour 1 jusqu'à periodLength
    if (cycleDay <= periodLength) {
      return { bg: '#E85A71', color: '#FFFFFF', isPeriod: true, isFertile: false };
    }

    // Ovulation : cycleLength - 14
    const ovulationDay = cycleLength - 14;

    // Période féconde : 3 jours avant ovulation + jour ovulation + 2 jours après = 6 jours
    const fertilityStart = ovulationDay - 3;
    const fertilityEnd = ovulationDay + 2;

    if (cycleDay >= fertilityStart && cycleDay <= fertilityEnd) {
      return { bg: '#87CEEB', color: '#FFFFFF', isPeriod: false, isFertile: true };
    }

    return { bg: '#F8F9FA', color: '#2B2B2B', isPeriod: false, isFertile: false };
  };

  const handleDayPress = (day: number) => {
    console.log('[CalendrierMensuel] Tap sur jour:', day);
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (onSelectDate) {
      onSelectDate(selectedDate);
    } else {
      console.warn('[CalendrierMensuel] onSelectDate non défini !');
    }
  };

  return (
    <View style={styles.card}>
      {/* En-tête */}
      <View style={styles.headerRow}>
        <Text style={styles.monthTitle}>
          {today.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Jours de la semaine */}
      <View style={styles.weekDaysRow}>
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((w, idx) => (
          <Text key={idx} style={styles.weekDayText}>{w}</Text>
        ))}
      </View>

      {/* Grille des jours */}
      <View style={styles.grid}>
        {daysArray.map((day) => {
          const styleInfo = getDayStyle(day);
          const isToday = day === today.getDate();

          return (
            <Pressable
              key={day}
              style={({ pressed }) => [
                styles.dayCell,
                { backgroundColor: styleInfo.bg },
                isToday && styles.todayBorder,
                pressed && styles.pressed,
              ]}
              onPress={() => handleDayPress(day)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: styleInfo.color },
                  isToday && styles.todayText,
                ]}
              >
                {day}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Légende */}
      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#E85A71' }]} />
          <Text style={styles.legendLabel}>Règles</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#87CEEB' }]} />
          <Text style={styles.legendLabel}>Période féconde</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 24,
    width: '90%',
    maxWidth: 360,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    marginBottom: 16,
    alignItems: 'center',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2B2B2B',
    textTransform: 'capitalize',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  weekDayText: {
    width: 36,
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
    color: '#A0A0A0',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayCell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBorder: {
    borderWidth: 2,
    borderColor: '#2B2B2B',
  },
  pressed: {
    opacity: 0.6,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '600',
  },
  todayText: {
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
});
