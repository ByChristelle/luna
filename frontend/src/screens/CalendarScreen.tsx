import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useCycleStore } from '../../stores/cycleStore';
import { useCycleHistoryStore } from '../../stores/cycleHistoryStore';
import CalendrierMensuel from '../../components/ui/CalendrierMensuel';
import Toast from '../../components/ui/Toast';
import { COLORS, FONTS } from '../../constants/theme';

export default function CalendarScreen() {
  const { profile } = useCycleStore();
  const { saveCycle, fetchLatestCycle, latestCycle, loading } = useCycleHistoryStore();

  const [lastPeriodDate, setLastPeriodDate] = useState<string>(
    profile?.last_period_date || new Date().toISOString().split('T')[0]
  );

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  useEffect(() => {
    fetchLatestCycle();
  }, []);

  useEffect(() => {
    if (latestCycle?.period_start_date) {
      setLastPeriodDate(latestCycle.period_start_date);
    } else if (profile?.last_period_date) {
      setLastPeriodDate(profile.last_period_date);
    }
  }, [latestCycle, profile]);

  const handleSelectDate = async (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setLastPeriodDate(formattedDate);

    const result = await saveCycle(formattedDate);

    if (result.success) {
      showToast('Cycle sauvegardé avec succès !', 'success');
    } else {
      showToast(result.error || 'Impossible de sauvegarder le cycle.', 'error');
      setLastPeriodDate(latestCycle?.period_start_date || profile?.last_period_date || formattedDate);
    }
  };

  const cycleLength = parseInt(String(profile?.cycle_length || '28'), 10);
  const periodLength = parseInt(String(profile?.period_length || '5'), 10);

  return (
    <View style={styles.container}>
      {/* Toast */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Sauvegarde...</Text>
        </View>
      )}

      <CalendrierMensuel
        lastPeriodDate={lastPeriodDate}
        cycleLength={cycleLength}
        periodLength={periodLength}
        onSelectDate={handleSelectDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: COLORS.primary,
  },
});
