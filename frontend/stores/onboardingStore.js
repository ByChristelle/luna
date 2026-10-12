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

      // Mettre à jour has_completed_onboarding dans le store auth
      const currentUser = useAuthStore.getState().user;
      if (currentUser) {
        useAuthStore.setState({
          user: { ...currentUser, has_completed_onboarding: true }
        });
      }

      return { success: true, data: response.data };
    } catch (err) {
      console.log('[onboardingStore] erreur:', err.message, err.code, err.response?.status, err.response?.data);
      set({
        loading: false,
        error: err.response?.data?.detail || "Erreur lors de l'enregistrement",
      });
      return { success: false };
    }
  },
}));