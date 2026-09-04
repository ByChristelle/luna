import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  console.log('[cycleHistoryStore] token:', token ? 'présent' : 'absent');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useCycleHistoryStore = create((set) => ({
  cycles: [],
  latestCycle: null,
  loading: false,
  error: null,

  // Enregistre un nouveau cycle (appelé quand la dame tape une date)
  saveCycle: async (periodStartDate) => {
    console.log('[saveCycle] Début - date:', periodStartDate);
    set({ loading: true, error: null });
    try {
      const headers = getAuthHeaders();
      console.log('[saveCycle] Headers:', headers);
      const response = await axios.post(
        `${BASE_URL}/cycles/`,
        { period_start_date: periodStartDate },
        { headers }
      );
      console.log('[saveCycle] Succès:', response.data);
      set((state) => ({
        latestCycle: response.data,
        cycles: [response.data, ...state.cycles],
        loading: false,
      }));
      return { success: true, data: response.data };
    } catch (err) {
      console.log('[saveCycle] Erreur:', err.response?.status, err.response?.data);
      const message = err.response?.data?.detail || 'Erreur lors de la sauvegarde du cycle';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Récupère tous les cycles depuis l'API
  fetchCycles: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/cycles/`, { headers: getAuthHeaders() });
      set({ cycles: response.data, loading: false });
      return { success: true };
    } catch (err) {
      console.log('[fetchCycles] Erreur:', err.response?.status);
      const message = err.response?.data?.detail || 'Erreur lors de la récupération des cycles';
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  // Récupère le dernier cycle
  fetchLatestCycle: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/cycles/latest`, { headers: getAuthHeaders() });
      console.log('[fetchLatestCycle] Succès:', response.data);
      set({ latestCycle: response.data, loading: false });
      return { success: true, data: response.data };
    } catch (err) {
      console.log('[fetchLatestCycle] Erreur:', err.response?.status);
      set({ latestCycle: null, loading: false });
      return { success: false };
    }
  },
}));
