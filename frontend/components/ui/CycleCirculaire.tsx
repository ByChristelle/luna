import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';

const { width } = Dimensions.get('window');

interface CalendrierCirculaireProps {
  periodLength?: number;
  cycleLength?: number;
  lastPeriodDate?: Date;
}

const PHASE_COLORS = {
  menstruelle: { base: '#E85A71', label: 'Règles', emoji: '🩸' },
  folliculaire: { base: '#FFFFFF', label: 'Phase folliculaire', emoji: '🌸' },
  ovulation: { base: '#87CEEB', label: 'Période féconde', emoji: '✨' },
  luteale: { base: '#FFFFFF', label: 'Phase lutéale', emoji: '🌙' },
};

const CalendrierCirculaire: React.FC<CalendrierCirculaireProps> = ({
  periodLength = 5,
  cycleLength = 28,
  lastPeriodDate = new Date(),
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const today = new Date();

  // Navigation des mois
  const changeMonth = (direction: number) => {
    const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1);
    setCurrentMonth(newDate);
  };

  const monthName = currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Calcul du jour et de la phase du cycle
  const getPhaseDataForDate = (date: Date) => {
    const diffTime = date.getTime() - lastPeriodDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const dayOfCycle = ((diffDays % cycleLength) + cycleLength) % cycleLength + 1;

    // Ovulation = cycleLength - 14, période féconde = 3 avant + 2 après
    const ovulationDay = cycleLength - 14;
    const fertilityStart = ovulationDay - 3;
    const fertilityEnd = ovulationDay + 2;

    let phase = { key: 'luteale', ...PHASE_COLORS.luteale };
    if (dayOfCycle <= periodLength) phase = { key: 'menstruelle', ...PHASE_COLORS.menstruelle };
    else if (dayOfCycle >= fertilityStart && dayOfCycle <= fertilityEnd) phase = { key: 'ovulation', ...PHASE_COLORS.ovulation };
    else if (dayOfCycle < fertilityStart) phase = { key: 'folliculaire', ...PHASE_COLORS.folliculaire };

    return { dayOfCycle, phase };
  };

  // Génération des jours du mois actif pour la roue
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  const monthDays = Array.from({ length: totalDaysInMonth }, (_, i) => i + 1);

  // Dimensions trigonométriques du cercle
  const containerSize = Math.min(width - 40, 340);
  const radius = containerSize * 0.38;
  const center = containerSize / 2;
  const angleStep = (2 * Math.PI) / totalDaysInMonth;

  // Données du jour actuel au centre
  const { dayOfCycle, phase } = getPhaseDataForDate(today);
  const daysUntilNext = dayOfCycle <= periodLength ? periodLength - dayOfCycle + 1 : cycleLength - dayOfCycle + 1;

  return (
    <View style={styles.wrapper}>
      {/* Navigation entre mois en haut */}
      <View style={styles.header}>
        <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color={COLORS.primary} />
        </Pressable>
        
        <Text style={styles.monthTitle}>
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
        </Text>
        
        <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color={COLORS.primary} />
        </Pressable>
      </View>

      {/* Roue circulaire du mois */}
      <View style={[styles.circleContainer, { width: containerSize, height: containerSize }]}>
        {monthDays.map((dayNum) => {
          const angle = -Math.PI / 2 + (dayNum - 1) * angleStep;
          const x = center + radius * Math.cos(angle) - 15;
          const y = center + radius * Math.sin(angle) - 15;

          const dateCell = new Date(year, month, dayNum);
          const isToday = today.toDateString() === dateCell.toDateString();
          const { phase: dayPhase } = getPhaseDataForDate(dateCell);
          const isTodayPeriod = isToday && dayPhase.key === 'menstruelle';

          return (
            <View
              key={dayNum}
              style={[
                styles.bead,
                { left: x, top: y, backgroundColor: isToday ? '#A78FB5' : dayPhase.base },
                isToday && { transform: [{ scale: 1.25 }] },
                isTodayPeriod && { borderWidth: 2.5, borderColor: '#E85A71' },
              ]}
            >
              <Text style={[
                styles.beadText,
                { color: (isToday || dayPhase.base !== '#FFFFFF') ? '#FFFFFF' : COLORS.textMain },
              ]}>
                {dayNum}
              </Text>
            </View>
          );
        })}

        {/* Textes au centre de la roue */}
        <View style={styles.centerContent}>
          <Text style={styles.centerDayNumber}>{today.getDate()}</Text>
          <Text style={styles.centerPhaseTitle}>J{dayOfCycle} - {phase.label}</Text>
          <Text style={styles.centerSubText}>Phase: {phase.label} {phase.emoji}</Text>
          <Text style={styles.centerDaysLeft}>Il reste {daysUntilNext} jour{daysUntilNext > 1 ? 's' : ''}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 15,
  },
  monthTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.textMain,
  },
  navButton: {
    padding: 8,
  },
  circleContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bead: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  beadText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.textMain,
  },
  beadTextActive: {
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerDayNumber: {
    fontFamily: FONTS.bold,
    fontSize: 44,
    color: COLORS.textMain,
    lineHeight: 48,
  },
  centerPhaseTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
    marginTop: 4,
  },
  centerSubText: {
    fontFamily: FONTS.medium,
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  centerDaysLeft: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
});

export default CalendrierCirculaire;