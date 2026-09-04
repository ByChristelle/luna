import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../stores/authStore';
import { useCycleStore } from '../../stores/cycleStore';
import { COLORS, FONTS } from '../../constants/theme';
import Toast from '../../components/ui/Toast';
import axios from 'axios';

const GOALS = ['Suivre mes règles', 'Concevoir un enfant', 'Suivre ma grossesse'];
const FLOWS = ['Léger', 'Moyen', 'Abondant'];
const SYMPTOMS_LIST = ['Crampes', 'Fatigue', "Sautes d'humeur", 'Acné', 'Maux de tête', 'Ballonnements'];

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { profile, fetchCycle } = useCycleStore();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');

  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    cycleLength: '28',
    periodLength: '5',
    flow: '',
    symptoms: [] as string[],
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Charger le profil existant
  useEffect(() => {
    if (profile) {
      setFormData({
        goal: profile.goal || '',
        age: profile.age?.toString() || '',
        cycleLength: profile.cycle_length?.toString() || '28',
        periodLength: profile.period_length?.toString() || '5',
        flow: profile.flow || '',
        symptoms: (() => {
          try { return JSON.parse(profile.symptoms || '[]'); }
          catch { return []; }
        })(),
      });
    }
  }, [profile]);

  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter((s) => s !== symptom)
        : [...prev.symptoms, symptom],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = useAuthStore.getState().token;
      await axios.post(
        'http://127.0.0.1:8000/api/profiles/onboarding',
        {
          goal: formData.goal,
          age: parseInt(formData.age, 10) || 0,
          last_period_date: profile?.last_period_date || new Date().toISOString().split('T')[0],
          cycle_length: formData.cycleLength,
          period_length: formData.periodLength,
          is_regular: 'true',
          flow: formData.flow,
          symptoms: JSON.stringify(formData.symptoms),
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchCycle();
      showToast('Profil mis à jour avec succès !', 'success');
    } catch (err: any) {
      showToast(err.response?.data?.detail || 'Erreur lors de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const userName = (user as any)?.first_name || (user as any)?.name || (user as any)?.email?.split('@')[0] || 'Chérie';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Toast visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* En-tête profil */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{(user as any)?.email || ''}</Text>
        </View>

        {/* Section Objectif */}
        <Text style={styles.sectionTitle}>Mon objectif</Text>
        <View style={styles.optionsRow}>
          {GOALS.map((item) => (
            <Pressable
              key={item}
              style={[styles.optionBtn, formData.goal === item && styles.optionBtnActive]}
              onPress={() => setFormData({ ...formData, goal: item })}
            >
              <Text style={[styles.optionText, formData.goal === item && styles.optionTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Cycle */}
        <Text style={styles.sectionTitle}>Mon cycle</Text>
        <View style={styles.card}>
          <View style={styles.inputRow}>
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Durée du cycle (jours)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.cycleLength}
                onChangeText={(val) => setFormData({ ...formData, cycleLength: val })}
              />
            </View>
            <View style={styles.inputBlock}>
              <Text style={styles.inputLabel}>Durée des règles (jours)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={formData.periodLength}
                onChangeText={(val) => setFormData({ ...formData, periodLength: val })}
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Âge</Text>
          <TextInput
            style={[styles.input, { marginTop: 6 }]}
            keyboardType="numeric"
            value={formData.age}
            onChangeText={(val) => setFormData({ ...formData, age: val })}
          />
        </View>

        {/* Section Flux */}
        <Text style={styles.sectionTitle}>Flux habituel</Text>
        <View style={styles.optionsRow}>
          {FLOWS.map((item) => (
            <Pressable
              key={item}
              style={[styles.optionBtn, formData.flow === item && styles.optionBtnActive]}
              onPress={() => setFormData({ ...formData, flow: item })}
            >
              <Text style={[styles.optionText, formData.flow === item && styles.optionTextActive]}>
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Section Symptômes */}
        <Text style={styles.sectionTitle}>Mes symptômes fréquents</Text>
        <View style={styles.symptomsGrid}>
          {SYMPTOMS_LIST.map((symptom) => {
            const isSelected = formData.symptoms.includes(symptom);
            return (
              <Pressable
                key={symptom}
                style={[styles.symptomBtn, isSelected && styles.symptomBtnActive]}
                onPress={() => toggleSymptom(symptom)}
              >
                {isSelected && <Ionicons name="checkmark-circle" size={14} color={COLORS.primary} style={{ marginRight: 4 }} />}
                <Text style={[styles.symptomText, isSelected && styles.symptomTextActive]}>
                  {symptom}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Bouton Sauvegarder */}
        <Pressable style={styles.saveBtn} onPress={handleSave} disabled={saving}>
          {saving
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Sauvegarder les modifications</Text>
          }
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20 },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 20,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.primary,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.textMain,
  },
  userEmail: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.textMain,
    marginBottom: 12,
    marginTop: 8,
  },
  optionsRow: {
    gap: 8,
    marginBottom: 20,
  },
  optionBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  optionText: {
    fontFamily: FONTS.medium,
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  optionTextActive: {
    color: COLORS.primary,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 20,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  inputBlock: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 12,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: COLORS.textMain,
    backgroundColor: COLORS.background,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  symptomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  symptomBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  symptomText: {
    fontFamily: FONTS.medium,
    fontSize: 13,
    color: COLORS.textMuted,
  },
  symptomTextActive: {
    color: COLORS.primary,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: '#FFFFFF',
  },
});
