import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { calculateCycleMetrics } from '../utils/cycle';
import CalendrierMensuel from '../../components/ui/CalendrierMensuel';

export default function CalendarScreen() {
  const { user, updatePeriodDate } = useAuthStore();
  
  

  const handleSelectDate = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    
    // 1. Mise à jour immédiate dans Zustand (se répercutera sur la roue dans Home)
    updatePeriodDate(formattedDate);

    // 2. Envoi au backend (à décommenter si ton API est prête)
    // api.patch('/profiles/me', { last_period_date: formattedDate });
  };

  // Récupération des données du profil
  const lastPeriodDate = (user as any)?.profile?.last_period_date || '2026-08-01';
  const cycleLength = (user as any)?.profile?.cycle_length || 28;
  const periodLength = (user as any)?.profile?.period_length || 5;

  return (
    <View style={styles.container}>
      <CalendrierMensuel 
  periodLength={userOnboardingData.periodLength}
  cycleLength={userOnboardingData.cycleLength}
  lastPeriodDate={new Date(userOnboardingData.lastPeriodDate)}
  onSelectDay={(date) => console.log(date)}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justify: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});