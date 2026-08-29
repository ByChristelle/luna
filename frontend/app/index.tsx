import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Logo from '../components/ui/Logo';
import CycleCirculaire from '../components/ui/CycleCirculaire';
import { useAuthStore } from '../stores/authStore';
import { useCycleStore } from '../stores/cycleStore';
import api from '../services/api';
import { styles } from './index.styles';
import { COLORS } from '../constants/theme';


const PHASE_LABELS = {
  menstruelle: 'Règles',
  folliculaire: 'Folliculaire',
  ovulation: 'Ovulation',
  luteale: 'Lutéale',
};

type SharedCycleData = {
  first_name: string;
  cycle_length: number;
  period_length: number;
  current_day: number;
  next_period_in: number;
  next_period_date_short: string;
  next_period_date_long: string;
  ovulation_in: number;
  ovulation_day: number;
  ovulation_date_short: string;
  phase: string;
  fertility_start_day: number;
  fertility_end_day: number;
  fertility_start_date_short: string;
  fertility_end_date_short: string;
  fertility_in: number;
  is_fertility_window: boolean;
};

export default function indexScreen() {
  const router = useRouter();
  const { token: shareToken } = useGlobalSearchParams<{ token?: string }>();
  const { token, user } = useAuthStore();
  const { data: cycleData, loading: cycleLoading, error: cycleError, fetchCycle } = useCycleStore();

  const [guestData, setGuestData] = useState<SharedCycleData | null>(null);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState<string | null>(null);

  const isLoggedIn = !!token;
  const isGuest = !!shareToken && !isLoggedIn;

  const fetchSharedData = async (shareTokenParam: string) => {
    setGuestLoading(true);
    setGuestError(null);
    try {
      const response = await api.get(`/share/${shareTokenParam}`);
      const data: SharedCycleData = response.data;
      setGuestData(data);
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      setGuestError(detail || err?.message || 'Lien de partage invalide ou introuvable.');
    } finally {
      setGuestLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCycle();
    } else if (shareToken) {
      fetchSharedData(shareToken);
    }
  }, [isLoggedIn, shareToken]);

 
  // 1) MODE INVITÉ (token dans l'URL) — Dashboard lecture seule
  if (isGuest) {
    const loading = guestLoading;
    const hasData = !loading && !guestError && guestData;

    if (loading) {
      return (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <View style={[styles.screen, styles.loaderWrap]}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Chargement du cycle partagé...</Text>
          </View>
        </SafeAreaView>
      );
    }

    if (guestError) {
      return (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
            {/* BANDEAU INVITÉ (même en cas d'erreur) */}
            <View style={styles.guestBanner}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.primary} />
              <Text style={styles.guestBannerText}>Mode invité · Consultation uniquement</Text>
            </View>

            <View style={[styles.cycleCard, styles.cardCentered]}>
              <Ionicons name="alert-circle-outline" size={38} color={COLORS.primary} />
              <Text style={styles.errorTitle}>Lien de partage invalide</Text>
              <Text style={styles.errorSub}>{guestError}</Text>
              <Pressable
                style={({ pressed }) => [styles.ctaMini, pressed && styles.pressed]}
                onPress={() => router.push('/')}
              >
                <Text style={styles.ctaMiniText}>Retour à l'accueil</Text>
              </Pressable>
            </View>

            <View style={{ height: 20 }} />

            <Pressable
              style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}
              onPress={() => router.push('/register')}
            >
              <View style={styles.ctaPrimaryGradient} />
              <Text style={styles.ctaPrimaryText}>🌸 Créer mon compte Luna</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      );
    }

    if (hasData) {
      const guestFirstName = guestData.first_name;
      const guestCycle = {
        cycleLength: guestData.cycle_length,
        periodLength: guestData.period_length,
        currentDay: guestData.current_day,
        nextPeriodIn: guestData.next_period_in,
        nextPeriodDateShort: guestData.next_period_date_short,
        nextPeriodDateLong: guestData.next_period_date_long,
        ovulationIn: guestData.ovulation_in,
        ovulationDay: guestData.ovulation_day,
        ovulationDateShort: guestData.ovulation_date_short,
        phase: guestData.phase,
        fertilityStartDay: guestData.fertility_start_day,
        fertilityEndDay: guestData.fertility_end_day,
        fertilityStartDateShort: guestData.fertility_start_date_short,
        fertilityEndDateShort: guestData.fertility_end_date_short,
        fertilityIn: guestData.fertility_in,
        isFertilityWindow: guestData.is_fertility_window,
      };

      const quickStats = [
        {
          icon: 'water-outline',
          label: 'Prochaines règles',
          value: guestCycle.nextPeriodDateShort,
          subValue: `dans ${guestCycle.nextPeriodIn} j.`,
          color: COLORS.primary,
          bg: COLORS.primaryLight,
        },
        {
          icon: 'sparkles-outline',
          label: 'Ovulation',
          value: guestCycle.ovulationDateShort,
          subValue: guestCycle.ovulationIn > 0
            ? `dans ${guestCycle.ovulationIn} j.`
            : 'En cours',
          color: '#D98F7A',
          bg: '#FBE9DF',
        },
        {
          icon: 'flame-outline',
          label: 'Période fertile',
          value: guestCycle.isFertilityWindow
            ? 'En cours 🔥'
            : `${guestCycle.fertilityStartDateShort} → ${guestCycle.fertilityEndDateShort}`,
          subValue: guestCycle.isFertilityWindow
            ? 'Haute probabilité'
            : guestCycle.fertilityIn > 0
              ? `dans ${guestCycle.fertilityIn} j.`
              : 'Bientôt',
          color: '#E85D75',
          bg: '#FCE4E8',
        },
        {
          icon: 'heart-outline',
          label: 'Phase actuelle',
          value: PHASE_LABELS[guestCycle.phase as keyof typeof PHASE_LABELS] || 'Folliculaire',
          subValue: `Jour ${guestCycle.currentDay} / ${guestCycle.cycleLength}`,
          color: '#A78FB5',
          bg: '#ECE1F3',
        },
      ];

      return (
        <SafeAreaView style={styles.safe} edges={['top']}>
          <ScrollView
            style={styles.screen}
            contentContainerStyle={styles.screenContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ===== BANDEAU INVITÉ — Consultation UNIQUEMENT ===== */}
            <View style={styles.guestBanner}>
              <Ionicons name="lock-closed-outline" size={16} color={COLORS.primary} />
              <Text style={styles.guestBannerText}>Mode invité · Consultation uniquement</Text>
              <Pressable
                style={({ pressed }) => [styles.guestCta, pressed && styles.pressed]}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.guestCtaText}>Créer mon compte</Text>
              </Pressable>
            </View>

            {/* ===== EN-TÊTE ===== */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Logo size={44} />
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.helloText}>Cycle de</Text>
                  <Text style={styles.nameText}>{guestFirstName} 💕</Text>
                </View>
              </View>
            </View>

            {/* ===== CYCLE CIRCULAIRE ===== */}
            <View style={styles.cycleCard}>
              <Text style={styles.sectionTitle}>Son Cycle</Text>
              <View style={{ alignItems: 'center', marginTop: 16 }}>
                <CycleCirculaire
                  cycleLength={guestCycle.cycleLength}
                  periodLength={guestCycle.periodLength}
                  currentDay={guestCycle.currentDay}
                />
              </View>
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

            {/* ===== BLOC : Créer mon propre suivi ===== */}
            <View style={[styles.cycleCard, styles.cardCentered]}>
              <Ionicons name="heart-circle-outline" size={36} color={COLORS.primary} />
              <Text style={styles.errorTitle}>Prête à suivre ton propre cycle ?</Text>
              <Text style={styles.errorSub}>
                Rejoins Luna et découvre un accompagnement personnalisé chaque jour.
              </Text>
              <Pressable
                style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed, { marginTop: 16, width: '100%' }]}
                onPress={() => router.push('/register')}
              >
                <View style={styles.ctaPrimaryGradient} />
                <Text style={styles.ctaPrimaryText}>🌸 Créer mon compte Luna</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.ctaSecondary, pressed && styles.pressed, { marginTop: 10, width: '100%' }]}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.ctaSecondaryText}>J'ai déjà un compte</Text>
              </Pressable>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      );
    }
  }

  /* =========================  DASHBOARD (UTILISATEUR CONNECTÉ)  ============ */
  if (isLoggedIn) {
    const firstName =
      (user as any)?.first_name ||
      (user as any)?.name ||
      (user as any)?.email?.split?.('@')?.[0] ||
      'Chérie';

    // Fallback si le profil n'existe pas encore (pas d'onboarding)
    const displayCycle = cycleData || {
      cycleLength: 28,
      periodLength: 5,
      currentDay: 1,
      nextPeriodIn: 27,
      nextPeriodDateShort: '21 sept.',
      nextPeriodDateLong: '21/09/2026',
      ovulationIn: 12,
      ovulationDay: 14,
      ovulationDateShort: '8 sept.',
      phase: 'folliculaire',
      fertilityStartDay: 9,
      fertilityEndDay: 15,
      fertilityStartDateShort: '3 sept.',
      fertilityEndDateShort: '9 sept.',
      fertilityIn: 8,
      isFertilityWindow: false,
    };

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
        value: PHASE_LABELS[displayCycle.phase] || 'Folliculaire',
        subValue: `Jour ${displayCycle.currentDay} / ${displayCycle.cycleLength}`,
        color: '#A78FB5',
        bg: '#ECE1F3',
      },
    ];

    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.screen}
          contentContainerStyle={styles.screenContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ===== EN-TÊTE ===== */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Logo size={44} />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.helloText}>Bonjour,</Text>
                <Text style={styles.nameText}>{firstName} 💕</Text>
              </View>
            </View>
            <Pressable
              style={styles.notifBtn}
              onPress={() => router.push('/(tabs)/calendar')}
            >
              <Ionicons name="notifications-outline" size={22} color={COLORS.textMain} />
              <View style={styles.notifDot} />
            </Pressable>
          </View>

          {/* ===== CHARGEMENT ===== */}
          {cycleLoading && (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loaderText}>Chargement de votre cycle...</Text>
            </View>
          )}

          {/* ===== ERREUR (pas de profil, etc.) ===== */}
          {!cycleLoading && cycleError && (
            <View style={[styles.cycleCard, styles.cardCentered]}>
              <Ionicons name="alert-circle-outline" size={38} color={COLORS.primary} />
              <Text style={styles.errorTitle}>On finit de préparer votre profil ?</Text>
              <Text style={styles.errorSub}>{cycleError}</Text>
              <Pressable
                style={({ pressed }) => [styles.ctaMini, pressed && styles.pressed]}
                onPress={() => router.push('/(tabs)/onboarding')}
              >
                <Text style={styles.ctaMiniText}>Compléter mon profil</Text>
              </Pressable>
            </View>
          )}

          {/* ===== CYCLE CIRCULAIRE ===== */}
          {!cycleLoading && !cycleError && (
            <View style={styles.cycleCard}>
              <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>Mon Cycle</Text>
                <Pressable
                  onPress={() => router.push('/(tabs)/calendar')}
                  style={styles.seeMoreBtn}
                >
                  <Text style={styles.seeMoreText}>Détails</Text>
                  <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
                </Pressable>
              </View>

              <CycleCirculaire
                cycleLength={displayCycle.cycleLength}
                periodLength={displayCycle.periodLength}
                currentDay={displayCycle.currentDay}
              />
            </View>
          )}

          {/* ===== STATS RAPIDES ===== */}
          {!cycleLoading && (
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
          )}

          {/* ===== RACCOURCIS ===== */}
          {!cycleLoading && (
            <View style={styles.shortcutsSection}>
              <Text style={styles.sectionTitle}>Raccourcis</Text>
              <View style={styles.shortcutsRow}>
                <Pressable
                  style={styles.shortcutBtn}
                  onPress={() => router.push('/(tabs)/calendar')}
                >
                  <View style={[styles.shortcutIcon, { backgroundColor: COLORS.primaryLight }]}>
                    <Ionicons name="add" size={26} color={COLORS.primary} />
                  </View>
                  <Text style={styles.shortcutLabel}>Noter ma journée</Text>
                </Pressable>

                <Pressable
                  style={styles.shortcutBtn}
                  onPress={() => router.push('/(tabs)/ai')}
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

  /* =========================  LANDING PAGE (PUBLIC)  ======================= */
  const features = [
    {
      icon: 'calendar-outline',
      title: 'Les Essentiels du Mois',
      desc: "Votre cycle, vos dates, tout en un coup d'œil.",
    },
    {
      icon: 'book-outline',
      title: 'Guide Éducatif',
      desc: 'Comprendre son corps à chaque phase du cycle.',
    },
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'Forum Luna',
      desc: 'Une communauté bienveillante et à l\'écoute.',
    },
    {
      icon: 'leaf-outline',
      title: 'Produits Éthiques',
      desc: 'Des recommandations douces et responsables.',
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== HERO SECTION ===== */}
      <View style={styles.hero}>
        <Logo size={110} />
        <Text style={styles.brandName}>Luna</Text>

        <Text style={styles.slogan}>Votre Compagnon Bienveillant.</Text>
        <Text style={styles.sloganLine2}>Comprendre, Gérer et Célébrer</Text>
        <Text style={styles.sloganScript}>votre cycle féminin.</Text>

        <View style={styles.ctaContainer}>
          <Pressable
            style={({ pressed }) => [styles.ctaPrimary, pressed && styles.pressed]}
            onPress={() => router.push('/register')}
          >
            <View style={styles.ctaPrimaryGradient} />
            <Text style={styles.ctaPrimaryText}>🌸 Commencer Mon Suivi</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.ctaSecondary, pressed && styles.pressed]}
            onPress={() => router.push('/login')}
          >
            <Text style={styles.ctaSecondaryText}>Se connecter</Text>
          </Pressable>
        </View>
      </View>

      {/* ===== WAVE SEPARATOR ===== */}
      <View style={styles.waveContainer}>
        <View style={styles.waveBar} />
      </View>

      {/* ===== FEATURES SECTION ===== */}
      <View style={styles.featuresSection}>
        <Text style={styles.featuresTitle}>Ce que Luna vous propose</Text>
        <Text style={styles.featuresSubtitle}>
          Tout ce qu'il faut pour suivre votre cycle en douceur
        </Text>

        <View style={styles.featuresGrid}>
          {features.map((f, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={styles.iconBubble}>
                <Ionicons name={f.icon as any} size={26} color={COLORS.primary} />
              </View>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ===== FOOTER ===== */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Fait avec 💕 par l'équipe Luna</Text>
      </View>
    </ScrollView>
  );
}


