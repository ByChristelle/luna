import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CycleCirculaire from './CycleCirculaire';
import { COLORS } from '../../constants/theme';
import { styles } from '../../src/screens/SuiviScreen.styles';

const PHASE_LABELS: Record<string, string> = {
  menstruelle: 'Règles',
  folliculaire: 'Folliculaire',
  ovulation: 'Ovulation',
  luteale: 'Lutéale',
};

export interface CycleData {
  cycleLength: number;
  periodLength: number;
  currentDay: number;
  phase: string;
  nextPeriodIn: number;
  nextPeriodDateShort: string;
  ovulationIn: number;
  ovulationDateShort: string;
  fertilityStartDateShort: string;
  fertilityEndDateShort: string;
  fertilityIn: number;
  isFertilityWindow: boolean;
  lastPeriodDate?: string;
}

interface CycleDashboardProps {
  cycleData: CycleData;
  userName: string;
  isGuest?: boolean;
  lastPeriodDate?: string; // date effective du dernier cycle enregistré
}

export default function CycleDashboard({
  cycleData,
  userName,
  isGuest = false,
  lastPeriodDate,
}: CycleDashboardProps) {
  const router = useRouter();

  const quickStats = [
    {
      icon: 'water-outline',
      label: 'Prochaines règles',
      value: cycleData.nextPeriodDateShort,
      subValue: `dans ${cycleData.nextPeriodIn} j.`,
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      icon: 'sparkles-outline',
      label: 'Ovulation',
      value: cycleData.ovulationDateShort,
      subValue: cycleData.ovulationIn > 0 ? `dans ${cycleData.ovulationIn} j.` : 'En cours',
      color: '#D98F7A',
      bg: '#FBE9DF',
    },
    {
      icon: 'flame-outline',
      label: 'Période fertile',
      value: cycleData.isFertilityWindow
        ? 'En cours 🔥'
        : `${cycleData.fertilityStartDateShort} → ${cycleData.fertilityEndDateShort}`,
      subValue: cycleData.isFertilityWindow
        ? 'Haute probabilité'
        : cycleData.fertilityIn > 0
          ? `dans ${cycleData.fertilityIn} j.`
          : 'Bientôt',
      color: '#E85D75',
      bg: '#FCE4E8',
    },
    {
      icon: 'heart-outline',
      label: 'Phase actuelle',
      value: PHASE_LABELS[cycleData.phase] || 'Folliculaire',
      subValue: `Jour ${cycleData.currentDay} / ${cycleData.cycleLength}`,
      color: '#A78FB5',
      bg: '#ECE1F3',
    },
  ];

  const effectiveLastPeriodDate = lastPeriodDate || cycleData.lastPeriodDate;

  return (
    <>
      {/* ===== CYCLE CIRCULAIRE ===== */}
      <View style={styles.cycleCard}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Cycle en cours</Text>
          {!isGuest && (
            <Pressable onPress={() => router.push('/calendar')} style={styles.seeMoreBtn}>
              <Text style={styles.seeMoreText}>Détails</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
            </Pressable>
          )}
        </View>

        <CycleCirculaire
          cycleLength={cycleData.cycleLength}
          periodLength={cycleData.periodLength}
          lastPeriodDate={effectiveLastPeriodDate ? new Date(effectiveLastPeriodDate) : new Date()}
        />
      </View>

      {/* ===== STATS RAPIDES ===== */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Aujourd'hui</Text>
        <View style={styles.statsGrid}>
          {quickStats.map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
                <Ionicons name={s.icon as any} size={20} color={s.color} />
              </View>
              <Text style={styles.statLabel}>{s.label}</Text>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              {s.subValue && (
                <Text style={styles.statSubValue}>{s.subValue}</Text>
              )}
            </View>
          ))}
        </View>
      </View>
    </>
  );
}
