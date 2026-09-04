import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

export const useOnboardingStore = create((set) => ({
  loading: false,
  error: null,

  submitOnboarding: async (formData) => {
    set({ loading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      console.log('[onboardingStore] token:', token ? 'présent' : 'absent');

      const response = await axios.post(
        'http://127.0.0.1:8000/api/profiles/onboarding',
        {
          goal: formData.goal,
          age: parseInt(formData.age, 10),
          last_period_date: formData.lastPeriod,
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

      set({ loading: false });
      return { success: true, data: response.data };
    } catch (err) {
      console.log('[onboardingStore] erreur:', err.response?.status, err.response?.data);
      set({
        loading: false,
        error: err.response?.data?.detail || "Erreur lors de l'enregistrement",
      });
      return { success: false };
    }
  },
}));


// import { create } from 'zustand';
// import { persist, createJSONStorage } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../services/api';

// export const useOnboardingStore = create(
//   persist(
//     (set) => ({
//       loading: false,
//       error: null,
//       profileData: null, // Données accessibles partout

//       submitOnboarding: async (formData) => {
//         set({ loading: true, error: null, profileData: formData }); // On garde formData en mémoire
//         try {
//           const response = await api.post('/profiles/onboarding', {
//             goal: formData.goal,
//             age: parseInt(formData.age, 10),
//             last_period_date: formData.lastPeriod,
//             cycle_length: parseInt(formData.cycleLength, 10),
//             period_length: parseInt(formData.periodLength, 10),
//             is_regular: true,
//             flow: formData.flow,
//             symptoms: JSON.stringify(formData.symptoms),
//           });
//           set({ loading: false });
//           return { success: true, data: response.data };
//         } catch (err) {
//           set({ loading: false, error: err.response?.data?.detail || "Erreur" });
//           return { success: false };
//         }
//       },
//     }),
//     {
//       name: 'onboarding-storage',
//       storage: createJSONStorage(() => AsyncStorage), // Sauvegarde auto sur le téléphone
//     }
//   )
// );