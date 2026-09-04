import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../constants/theme';
import { useAuthStore } from '../../stores/authStore';
import { styles } from './SuiviScreen.styles';
import ShareLinkModal from '../../components/ui/ShareLinkModal';
import { useCycleHistoryStore } from '../../stores/cycleHistoryStore';
import { useCycleStore, computeCycleData } from '../../stores/cycleStore';
import CycleDashboard, { CycleData } from '../../components/ui/CycleDashboard';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: storeCycleData, loading: storeLoading, error: storeError, fetchCycle } = useCycleStore();
  const { latestCycle, fetchLatestCycle } = useCycleHistoryStore();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [userName, setUserName] = useState<string>('Chérie');

  // Données du cycle en mode invité (remplies depuis l'API publique)
  const [guestCycleData, setGuestCycleData] = useState<CycleData | null>(null);

  // Chargement au montage
  useEffect(() => {
    if (token) {
      fetchSharedData(token);
    } else {
      setIsGuest(false);
      const name = (user as any)?.first_name || (user as any)?.name || (user as any)?.email?.split?.('@')?.[0] || 'Chérie';
      setUserName(name);
      fetchCycle();
      fetchLatestCycle();
    }
  }, [token]);

  // Récupération des données partagées (mode invité)
  const fetchSharedData = async (shareToken: string) => {
    setLoading(true);
    setError(null);
    try {
      setIsGuest(true);
      const response = await fetch(`http://localhost:8000/api/share/${shareToken}`);
      if (!response.ok) throw new Error('Ce lien de partage est invalide ou a expiré.');
      const data = await response.json();

      if (data.first_name) setUserName(data.first_name);

      // On recalcule depuis la même fonction que le mode connecté
      const computed = computeCycleData(
        data.last_period_date,
        data.cycle_length || 28,
        data.period_length || 5
      );
      setGuestCycleData(computed as CycleData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Données à afficher — même logique pour les deux modes
  const displayCycle = useMemo((): CycleData | null => {
    if (isGuest) return guestCycleData;

    const effectiveLastPeriodDate = latestCycle?.period_start_date || storeCycleData?.lastPeriodDate;
    const cycleLength = storeCycleData?.cycleLength || 28;
    const periodLength = storeCycleData?.periodLength || 5;

    if (effectiveLastPeriodDate) {
      return computeCycleData(effectiveLastPeriodDate, cycleLength, periodLength) as CycleData;
    }

    return (storeCycleData as CycleData) || null;
  }, [isGuest, guestCycleData, latestCycle, storeCycleData]);

  const isLoading = isGuest ? loading : loading || storeLoading;
  const displayError = isGuest ? error : error || storeError;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 10, color: '#666' }}>Chargement du suivi...</Text>
      </View>
    );
  }

  if (displayError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Ionicons name="alert-circle-outline" size={48} color={COLORS.primary} />
        <Text style={{ fontSize: 18, fontFamily: 'Poppins-Bold', color: COLORS.textMain, marginTop: 10 }}>
          {isGuest ? 'Lien Invalide' : 'Profil incomplet'}
        </Text>
        <Text style={{ textAlign: 'center', color: COLORS.textMuted, marginTop: 5 }}>{displayError}</Text>
        {!isGuest && (
          <Pressable
            onPress={() => router.push('/(tabs)/onboarding')}
            style={{ marginTop: 20, backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 20 }}
          >
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Compléter mon profil</Text>
          </Pressable>
        )}
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
        {/* ===== BANNIÈRE MODE INVITÉ ===== */}
        {isGuest && (
          <View style={{ backgroundColor: '#FEF3C7', padding: 12, borderRadius: 8, marginBottom: 15, flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="eye-outline" size={20} color="#92400E" style={{ marginRight: 8 }} />
            <Text style={{ color: '#92400E', fontSize: 13, flex: 1 }}>
              Vous consultez le suivi partagé de <Text style={{ fontWeight: 'bold' }}>{userName}</Text> (Mode lecture seule).
            </Text>
          </View>
        )}

        {/* ===== EN-TÊTE ===== */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {/* <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.helloText}>{isGuest ? 'Suivi de' : 'Bonjour,'}</Text>
              <Text style={styles.nameText}>{userName} 💕</Text>
            </View> */}
          </View>

          {!isGuest && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Pressable onPress={() => setShareModalVisible(true)}>
                <Ionicons name="share-social-outline" size={22} color={COLORS.textMain} />
              </Pressable>
              <Pressable style={styles.notifBtn} onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.textMain} />
                <View style={styles.notifDot} />
              </Pressable>
            </View>
          )}
        </View>

        {/* Modale de partage */}
        {!isGuest && (
          <ShareLinkModal
            visible={shareModalVisible}
            onClose={() => setShareModalVisible(false)}
          />
        )}

        {/* ===== DASHBOARD COMMUN (connectée + invitée) ===== */}
        {displayCycle && (
          <CycleDashboard
            cycleData={displayCycle}
            userName={userName}
            isGuest={isGuest}
            lastPeriodDate={latestCycle?.period_start_date || displayCycle.lastPeriodDate}
          />
        )}

        {/* ===== RACCOURCIS (mode connecté uniquement) ===== */}
        {!isGuest && (
          <View style={styles.shortcutsSection}>
            <Text style={styles.sectionTitle}>Raccourcis</Text>
            <View style={styles.shortcutsRow}>
              <Pressable style={styles.shortcutBtn} onPress={() => router.push('/calendar')}>
                <View style={[styles.shortcutIcon, { backgroundColor: COLORS.primaryLight }]}>
                  <Ionicons name="add" size={26} color={COLORS.primary} />
                </View>
                <Text style={styles.shortcutLabel}>Noter ma journée</Text>
              </Pressable>

              <Pressable style={styles.shortcutBtn} onPress={() => router.push('/ai')}>
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
