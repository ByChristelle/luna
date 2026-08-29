import { create } from 'zustand';
import API from '../services/api';

export const useExampleStore = create((set) => ({
  message: '',
  loading: true,

  fetchHealth: async () => {
    set({ loading: true });
    try {
      const response = await API.get('/health');
      set({ message: response.data.message, loading: false });
    } catch (error) {
      console.error('Erreur de connexion:', error);
      set({ message: 'Impossible de contacter le serveur', loading: false });
    }
  },
}));