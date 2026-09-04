import { create } from 'zustand';
import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api';

export const useNotificationStore = create((set) => ({
  preferences: null,
  loading: false,

  // Récupère les préférences
  fetchPreferences: async (token) => {
    set({ loading: true });
    try {
      const response = await axios.get(`${BASE_URL}/notifications/preferences`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      set({ preferences: response.data, loading: false });
    } catch (err) {
      console.log('[notificationStore] fetchPreferences erreur:', err.response?.status);
      set({ loading: false });
    }
  },

  // Met à jour les préférences
  updatePreferences: async (prefs, token) => {
    try {
      console.log('[notificationStore] token:', token ? 'présent' : 'absent');
      const response = await axios.patch(
        `${BASE_URL}/notifications/preferences`,
        prefs,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      set({ preferences: response.data });
      return { success: true };
    } catch (err) {
      console.log('[notificationStore] updatePreferences erreur:', err.response?.status, err.response?.data);
      return { success: false };
    }
  },

  // Enregistre le token de l'appareil
  registerToken: async (pushToken, authToken) => {
    if (!pushToken) return;
    try {
      await axios.post(
        `${BASE_URL}/notifications/register-token`,
        { token: pushToken },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      console.log('[notifications] Token enregistré avec succès');
    } catch (err) {
      console.log('[notifications] Erreur enregistrement token:', err.response?.data);
    }
  },
}));
