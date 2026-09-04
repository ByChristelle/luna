import { create } from 'zustand';
import API from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  error: null,
  token: null,

  setToken: async (token) => {
    // Sauvegarder dans AsyncStorage si vous l'utilisez
    // await AsyncStorage.setItem('token', token);
    set({ token });
  },


  //Pour l'inscription
  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/register', userData);
      set({ user: response.data.user, loading: false });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || "Erreur lors de l'inscription";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },


  //Pour la connexion
  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await API.post('/auth/login', credentials);
      set({ 
        user: response.data.user, 
        token: response.data.access_token, 
        loading: false 
      });
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.detail || "Erreur lors de la connexion";
      set({ error: message, loading: false });
      return { success: false, error: message };
    }
  },

  logout: () => {
    set({ user: null, token: null });
  },


  // Action à ajouter dans ton store
  updatePeriodDate: (newDate) => {
  set((state) => ({
    user: {
      ...state.user,
      profile: {
        ...state.user?.profile,
        last_period_date: newDate,
      },
    },
  }));
},
}));