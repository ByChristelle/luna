import React, { useEffect } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNotificationStore } from '../../stores/notificationStore';
import { useAuthStore } from '../../stores/authStore';
import { COLORS, FONTS } from '../../constants/theme';

const NOTIFICATION_OPTIONS = [
  {
    key: 'notify_before_period',
    title: 'Règles dans 2 jours',
    description: 'Reçois un rappel 2 jours avant tes prochaines règles',
    icon: 'water' as const,
    color: COLORS.primary,
    bg: COLORS.primaryLight,
  },
  {
    key: 'notify_period_start',
    title: 'Début des règles',
    description: 'Notification le jour où ton nouveau cycle commence',
    icon: 'refresh-circle' as const,
    color: '#E85A71',
    bg: '#FCE4E8',
  },
  {
    key: 'notify_fertility_start',
    title: 'Début de la période fertile',
    description: 'Sois informée quand ta fenêtre fertile commence',
    icon: 'leaf' as const,
    color: '#87CEEB',
    bg: '#E3F4FB',
  },
  {
    key: 'notify_ovulation',
    title: "Jour d'ovulation",
    description: "Notification le jour de ton ovulation",
    icon: 'sparkles' as const,
    color: '#D98F7A',
    bg: '#FBE9DF',
  },
  {
    key: 'notify_fertility_end',
    title: 'Fin de la période fertile',
    description: 'Rappel la veille de la fin de ta période fertile',
    icon: 'moon' as const,
    color: '#A78FB5',
    bg: '#ECE1F3',
  },
];

export default function NotificationSettingsScreen() {
  const { preferences, loading, fetchPreferences, updatePreferences } = useNotificationStore();
  const { token } = useAuthStore();

  useEffect(() => {
    if (token) fetchPreferences(token);
  }, [token]);

  const handleToggle = async (key: string, value: boolean) => {
    if (token) await updatePreferences({ [key]: value }, token);
  };

  if (loading && !preferences) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>

        <View style={styles.headerRow}>
          <Ionicons name="notifications" size={28} color={COLORS.ai} />
          <Text style={styles.title}>Notifications</Text>
        </View>
        <Text style={styles.subtitle}>
          Choisis les événements pour lesquels tu veux être notifiée
        </Text>

        <View style={styles.card}>
          {NOTIFICATION_OPTIONS.map((option, index) => (
            <View
              key={option.key}
              style={[
                styles.row,
                index < NOTIFICATION_OPTIONS.length - 1 && styles.rowBorder,
              ]}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconWrapper, { backgroundColor: option.bg }]}>
                  <Ionicons name={option.icon} size={20} color={option.color} />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDesc}>{option.description}</Text>
                </View>
              </View>
              <Switch
                value={preferences?.[option.key as keyof typeof preferences] ?? true}
                onValueChange={(value) => handleToggle(option.key, value)}
                trackColor={{ false: '#E0E0E0', true: COLORS.primaryLight }}
                thumbColor={
                  preferences?.[option.key as keyof typeof preferences]
                    ? COLORS.primary
                    : '#F5F5F5'
                }
                ios_backgroundColor="#E0E0E0"
              />
            </View>
          ))}
        </View>

        {/* Note du bas */}
        <View style={styles.noteRow}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.note}>
            Les notifications sont envoyées chaque matin à 8h00 selon ton cycle.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAF5FF' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FAF5FF' },
  content: { padding: 20 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontFamily: FONTS.bold,
    color: COLORS.textMain,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDE7F6',
    overflow: 'hidden',
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3E8FF',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textBlock: { flex: 1 },
  optionTitle: {
    fontSize: 15,
    fontFamily: FONTS.medium,
    color: COLORS.textMain,
    marginBottom: 2,
  },
  optionDesc: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 10,
    backgroundColor: '#F3E8FF',
    padding: 12,
    borderRadius: 14,
  },
  note: {
    flex: 1,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#7B1FA2',
    lineHeight: 18,
  },
});
