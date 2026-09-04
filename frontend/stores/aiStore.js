import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = 'http://127.0.0.1:8000/api';

const getAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const useAiStore = create((set) => ({
  messages: [],
  loading: false,
  error: null,

  // Charge l'historique depuis le backend
  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${BASE_URL}/ai/history`, {
        headers: getAuthHeaders(),
      });
      set({ messages: response.data, loading: false });
    } catch (err) {
      console.log('[aiStore] fetchHistory erreur:', err.response?.status);
      set({ loading: false });
    }
  },

  // Envoie un message et ajoute la réponse à l'historique
  sendMessage: async (prompt, cyclePhase = 'folliculaire', cycleDay = 1) => {
    set({ loading: true, error: null });

    // Ajout immédiat du message utilisateur (optimiste)
    const userMessage = { id: Date.now(), role: 'user', content: prompt };
    set((state) => ({ messages: [...state.messages, userMessage] }));

    try {
      const response = await axios.post(
        `${BASE_URL}/ai/ask`,
        { prompt, cycle_phase: cyclePhase, cycle_day: cycleDay },
        { headers: getAuthHeaders() }
      );
      // Ajout de la réponse de Luna
      set((state) => ({
        messages: [...state.messages, response.data],
        loading: false,
      }));
      return { success: true };
    } catch (err) {
      console.log('[aiStore] sendMessage erreur:', err.response?.data);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== userMessage.id),
        loading: false,
        error: 'Désolé, je rencontre un problème. Réessaie plus tard.',
      }));
      return { success: false };
    }
  },

  // Vide les messages du store (pas de la base)
  clearMessages: () => set({ messages: [] }),
}));
