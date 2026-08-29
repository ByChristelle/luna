import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import CycleCirculaire from '../../components/ui/CycleCirculaire';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { styles } from './SuiviScreen.styles';
import ShareLinkModal from '../../components/ui/ShareLinkModal';
import api from '../../services/api';

const PHASE_LABELS = {
  menstruelle: 'Règles',
  folliculaire: 'Folliculaire',
  ovulation: 'Ovulation',
  luteale: 'Lutéale',
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Store du cycle pour l'utilisatrice CONNECTÉE (vraies données)
  const { data: storeCycleData, loading: storeLoading, error: storeError, fetchCycle } = useCycleStore();

  // 1. Récupération du token de partage éventuel depuis l'URL (ex: /home?token=xxx)
  const { token } = useLocalSearchParams<{ token?: string }>();

  // États pour la gestion du mode invité et le chargement des données
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Modale de partage
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Nom par défaut de la dame
  const [guestName, setGuestName] = useState<string>('Chérie');

  // Données du cycle pour le mode INVITÉ (écrasées par l'API si token présent)
  const [cycleData, setCycleData] = useState({
    cycleLength: 28,
    periodLength: 5,
    currentDay: 1,
    nextPeriodIn: 27,
    nextPeriodDateShort: '21 sept.',
    ovulationIn: 12,
    ovulationDateShort: '8 sept.',
    phase: 'folliculaire',
    fertilityStartDateShort: '3 sept.',
    fertilityEndDateShort: '9 sept.',
    fertilityIn: 8,
    isFertilityWindow: false,
  });

  // 2. Détection du mode (Invité vs Connectée) au chargement
  useEffect(() => {
    if (token) {
      fetchSharedData(token);
    } else {
      setIsGuest(false);
      // Ici, si l'utilisatrice est connectée, tu gardes son prénom
      const name = (user as any)?.first_name || (user as any)?.name || (user as any)?.email?.split?.('@')?.[0] || 'Chérie';
      setGuestName(name);
      // On va chercher les VRAIES données de son cycle
      fetchCycle();
    }
  }, [token]);

  // 3. Fonction pour récupérer les données partagées du backend (FastAPI)
  const fetchSharedData = async (shareToken: string) => {
    setLoading(true);
    setError(null);
    try {
      setIsGuest(true);
      // Appel à ton endpoint public FastAPI
      const response = await fetch(`http://localhost:8000/share/${shareToken}`);

      if (!response.ok) {
        throw new Error('Ce lien de partage est invalide ou a expiré.');
      }

      const data = await response.json();

      // Mise à jour du nom et des métriques du cycle avec les données reçues
      if (data.first_name) setGuestName(data.first_name);
      setCycleData({
        cycleLength: data.cycle_length || 28,
        periodLength: data.period_length || 5,
        currentDay: data.current_day || 1,
        nextPeriodIn: data.next_period_in || 27,
        nextPeriodDateShort: data.next_period_date_short || '21 sept.',
        ovulationIn: data.ovulation_in || 12,
        ovulationDateShort: data.ovulation_date_short || '8 sept.',
        phase: data.phase || 'folliculaire',
        fertilityStartDateShort: data.fertility_start_date_short || '3 sept.',
        fertilityEndDateShort: data.fertility_end_date_short || '9 sept.',
        fertilityIn: data.fertility_in || 8,
        isFertilityWindow: !!data.is_fertility_window,
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Données affichées : store (vraies données) si connectée, sinon état local (invité)
  const displayCycle = !isGuest && storeCycleData ? storeCycleData : cycleData;

  const isLoading = isGuest ? loading : loading || storeLoading;
  const displayError = isGuest ? error : error || storeError;

  const quickStats = [
    {
      icon: 'water-outline',
      label: 'Prochaines règles',
      value: displayCycle.nextPeriodDateShort,
      subValue: `dans ${displayCycle.nextPeriodIn} j.`,
      color: COLORS.primary,
      bg: COLORS.primaryLight,
    },
    {
      icon: 'sparkles-outline',
      label: 'Ovulation',
      value: displayCycle.ovulationDateShort,
      subValue: displayCycle.ovulationIn > 0
        ? `dans ${displayCycle.ovulationIn} j.`
        : 'En cours',
      color: '#D98F7A',
      bg: '#FBE9DF',
    },
    {
      icon: 'flame-outline',
      label: 'Période fertile',
      value: displayCycle.isFertilityWindow
        ? 'En cours 🔥'
        : `${displayCycle.fertilityStartDateShort} → ${displayCycle.fertilityEndDateShort}`,
      subValue: displayCycle.isFertilityWindow
        ? 'Haute probabilité'
        : displayCycle.fertilityIn > 0
          ? `dans ${displayCycle.fertilityIn} j.`
          : 'Bientôt',
      color: '#E85D75',
      bg: '#FCE4E8',
    },
    {
      icon: 'heart-outline',
      label: 'Phase actuelle',
      value: PHASE_LABELS[displayCycle.phase as keyof typeof PHASE_LABELS] || 'Folliculaire',
      subValue: `Jour ${displayCycle.currentDay} / ${displayCycle.cycleLength}`,
      color: '#A78FB5',
      bg: '#ECE1F3',
    },
  ];

  // Affichage du loader tant que les données (invité ou connectée) sont en cours de chargement
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: '#666' }}>Chargement du suivi...</Text>
      </View>
    );
  }

  // Affichage d'un message d'erreur si le token est invalide/expiré ou si le cycle n'a pas pu être chargé
  if (displayError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={48} color="#E53E3E" />
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#E53E3E', marginTop: 10 }}>
          {isGuest ? 'Lien Invalide' : 'Erreur'}
        </Text>
        <Text style={{ textAlign: 'center', color: '#666', marginTop: 5 }}>{displayError}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ===== BANNIÈRE DISCRÈTE (UNISSEMENT POUR LE MODE INVITÉ) ===== */}
        {isGuest && (
          <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="eye-outline" size={20} color="#92400E" style={{ marginRight: 8 }} />
            <Text style={{ color: '#92400E', fontSize: 13, flex: 1 }}>
              Vous consultez le suivi partagé de <Text style={{ fontWeight: 'bold' }}>{guestName}</Text> (Mode lecture seule).
            </Text>
          </View>
        )}

        {/* ===== EN-TÊTE ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {guestName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.helloText}>{isGuest ? 'Suivi de' : 'Bonjour,'}</Text>
              <Text style={styles.nameText}>{guestName} 💕</Text>
            </View>
          </View>

          {/* Actions d'en-tête (Affichées uniquement pour l'utilisatrice connectée) */}
          {!isGuest && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              {/* Bouton pour ouvrir la modale de partage */}
              <Pressable onPress={() => setShareModalVisible(true)}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.textMain} />
              </Pressable>

              {/* Bouton Notifications */}
              <Pressable
                style={styles.notifBtn}
                onPress={() => router.push('/calendar')}
              >
                <Ionicons name="notifications-outline" size={22} color={COLORS.textMain} />
                <View style={styles.notifDot} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Modale de partage (Accessible uniquement par l'utilisatrice) */}
        {!isGuest && (
          <ShareLinkModal
            visible={shareModalVisible}
            onClose={() => setShareModalVisible(false)}
          />
        )}

        {/* ===== CYCLE CIRCULAIRE ===== */}
        <View style={styles.cycleCard}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Cycle en cours</Text>

            {/* Le bouton "Détails" est masqué pour l'invité */}
            {!isGuest && (
              <Pressable
                onPress={() => router.push('/calendar')}
                style={styles.seeMoreBtn}
              >
                <Text style={styles.seeMoreText}>Détails</Text>
                <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
              </Pressable>
            )}
          </View>

          <CycleCirculaire
            cycleLength={displayCycle.cycleLength}
            periodLength={displayCycle.periodLength}
            currentDay={displayCycle.currentDay}
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

        {/* ===== RACCOURCIS (Masqués en Mode Invité) ===== */}
        {!isGuest && (
          <View style={styles.shortcutsSection}>
            <Text style={styles.sectionTitle}>Raccourcis</Text>
            <View style={styles.shortcutsRow}>
              <Pressable
                style={styles.shortcutBtn}
                onPress={() => router.push('/calendar')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="add" size={26} color={COLORS.primary} />
                </View>
                <Text style={styles.shortcutLabel}>Noter ma journée</Text>
              </Pressable>

              <Pressable
                style={styles.shortcutBtn}
                onPress={() => router.push('/ai')}
              >
                <View style={[styles.shortcutIcon, { backgroundColor: '#ECE1F3' }]}>
                  <Ionicons name="chatbubble-ellipses-outline" size={24} color={COLORS.ai} />
                </View>
                <Text style={styles.shortcutLabel}>Parler à Luna AI</Text>
              </Pressable>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}