import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { styles } from './OnboardingScreen.styles';
import { useOnboardingStore } from '../../stores/onboardingStore';
import { useRouter } from 'expo-router';

LocaleConfig.locales['fr'] = {
  monthNames: ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'],
  monthNamesShort: ['Janv.','Févr.','Mars','Avril','Mai','Juin','Juil.','Août','Sept.','Oct.','Nov.','Déc.'],
  dayNames: ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'],
  dayNamesShort: ['Dim.','Lun.','Mar.','Mer.','Jeu.','Ven.','Sam.'],
  today: "Aujourd'hui"
};
LocaleConfig.defaultLocale = 'fr';

export default function OnboardingScreen() {
  const router = useRouter();
  const { submitOnboarding, loading } = useOnboardingStore();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    goal: '',
    age: '',
    lastPeriod: '',
    cycleLength: '28',
    periodLength: '5',
    flow: '',
    symptoms: [] as string[],
  });

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };


  //ajouter ou retirer un sympto dans le tab
  const toggleSymptom = (symptom: string) => {
    setFormData((prev) => {
      const exists = prev.symptoms.includes(symptom);
      return {
        ...prev,
        symptoms: exists
          ? prev.symptoms.filter((s) => s !== symptom)
          : [...prev.symptoms, symptom],
      };
    });
  };

  //le calcul en pourcentage de la barre de progression
  const progressPercent: `${number}%` = `${(step / totalSteps) * 100}%`;

  const handleSubmit = async () => {
    const res = await submitOnboarding(formData);
    console.log('[Onboarding] résultat:', res);

    if (res.success) {
      // Plus besoin d'AsyncStorage — has_completed_onboarding est en base
      router.replace('/(tabs)');
    } else {
      console.log('[Onboarding] erreur soumission');
    }
  };

  return (
    <View style={styles.container}>
      {/* En-tête + Barre de progression */}
      <View style={styles.progressHeader}>
        <Text style={styles.stepText}>Étape {step} sur {totalSteps}</Text>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: progressPercent }]} />
        </View>
      </View>

      {/* Contenu défilable */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ÉTAPE 1 */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 1 : Le Profil & l'Objectif 🎯</Text>

            <Text style={styles.label}>Quel est votre objectif principal ?</Text>
            {['Suivre mes règles', 'Concevoir un enfant', 'Suivre ma grossesse'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionCard, formData.goal === item && styles.selectedOption]}
                onPress={() => setFormData({ ...formData, goal: item })}
              >
                <Text style={[styles.optionText, formData.goal === item && styles.selectedOptionText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 20 }]}>Quel est votre âge ?</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 24"
              value={formData.age}
              onChangeText={(val) => setFormData({ ...formData, age: val })}
            />
          </View>
        )}

        {/* ÉTAPE 2 */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 2 : Le Calendrier actuel 📅</Text>
            <Text style={styles.label}>Date de vos dernières règles ?</Text>
            
            <Calendar
              maxDate={new Date().toISOString().split('T')[0]}
              // (convertir en format iso standard) .toISOString()=>"2026-08-28T13:01:25.000Z"
              onDayPress={(day) => {
                setFormData({ ...formData, lastPeriod: day.dateString });
              }}
              markedDates={{
                [formData.lastPeriod]: {
                  selected: true,
                  disableTouchEvent: true,
                  selectedColor: '#E91E63',
                  selectedTextColor: '#FFFFFF',
                },
              }}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#E91E63',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#E91E63',
                dayTextColor: '#2d4150',
                arrowColor: '#E91E63',
                monthTextColor: '#E91E63',
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 13,
                textMonthFontSize: 15,
              }}
              style={styles.calendarCard}
            />

            {formData.lastPeriod ? (
              <Text style={styles.selectedDateText}>
                Sélectionné : {formData.lastPeriod}
              </Text>
            ) : null}
          </View>
        )}

        {/* ÉTAPE 3 */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 3 : Les Habitudes du cycle ⏱️</Text>

            <Text style={styles.label}>Durée moyenne de votre cycle (jours)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 28"
              value={formData.cycleLength}
              onChangeText={(val) => setFormData({ ...formData, cycleLength: val })}
            />

            <Text style={[styles.label, { marginTop: 20 }]}>Durée de vos règles (jours)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Ex: 5"
              value={formData.periodLength}
              onChangeText={(val) => setFormData({ ...formData, periodLength: val })}
            />
          </View>
        )}

        {/* ÉTAPE 4 */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Étape 4 : Les Symptômes & le Flux 🩸</Text>

            <Text style={styles.label}>Flux habituel de vos règles</Text>
            {['Léger', 'Moyen', 'Abondant'].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.optionCard, formData.flow === item && styles.selectedOption]}
                onPress={() => setFormData({ ...formData, flow: item })}
              >
                <Text style={[styles.optionText, formData.flow === item && styles.selectedOptionText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}

            <Text style={[styles.label, { marginTop: 20 }]}>Symptômes fréquents (choix multiples)</Text>
            {['Crampes', 'Fatigue', 'Sautes d\'humeur', 'Acné', 'Maux de tête', 'Ballonnements'].map((symptom) => {
              const isSelected = formData.symptoms.includes(symptom);
              return (
                <TouchableOpacity
                  key={symptom}
                  style={[styles.optionCard, isSelected && styles.selectedOption]}
                  onPress={() => toggleSymptom(symptom)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {symptom}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Boutons fixes en bas */}
      <View style={styles.navigationButtons}>
        {step > 1 ? (
          <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
            <Text style={styles.prevBtnText}>Précédent</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ flex: 1 }} />
        )}

        {step < totalSteps ? (
          <TouchableOpacity style={styles.nextBtn} onPress={nextStep}>
            <Text style={styles.nextBtnText}>Suivant</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.nextBtn} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.nextBtnText}>Terminer</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}